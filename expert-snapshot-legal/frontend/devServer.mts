// devServer.mts
import './patch-path-to-regexp.js'; // must be first
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import * as dotenv from "dotenv";
import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import {
  mergeCandidates,
  sortCandidatesByDocumentOrder,
  logAllReadFields,
  deriveCandidatesFromRead,
  placeholderizeDocument,
} from "./src/utils/candidateUtils.js";
import { NormalizedMapping } from './src/types/confirmMapping.js';
import {
  saveCandidates,
  loadCandidates,
  deleteCandidates,
} from "./src/infrastructure/sessionStore.js";
import { mergeMappingWithCandidates } from "./src/server/adapters/mergeMappingWithCandidates.js";
import { logDebug } from "./src/utils/logger.js";

// load .env at startup
dotenv.config();

// then override with .env.local if present
dotenv.config({ path: ".env.local", override: true });

// Log effective TTL
const ttlMs = parseInt(process.env.CANDIDATE_TTL_MS || "", 10) || 60 * 60 * 1000;
console.log(`[startup] Candidate TTL set to ${ttlMs} ms (${Math.round(ttlMs / 1000 / 60)} minutes)`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

// ✅ Resolve from project root (micro-consult/)
const root = path.resolve(__dirname, '..', '..', '..');
const frontendBuildPath = path.resolve(root, 'expert-snapshot-legal/frontend/build/frontend');
const indexPath = path.join(frontendBuildPath, 'index.html');

// ✅ Base path for template storage (local dev): expert-snapshot-legal/frontend/storage
const storageBasePath = path.resolve(root, 'expert-snapshot-legal/frontend/storage');

// Allowed template extensions
const allowedExtensions = new Set(['.docx', '.pdf']);

// ✅ Initialize Azure Form Recognizer client
const formRecClient = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT!,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY!)
);

function getCustomerTemplatePath(customerId: string) {
  return path.join(storageBasePath, customerId, 'templates');
}

function getCustomerManifestPath(customerId: string) {
  return path.join(storageBasePath, customerId, 'manifests');
}

async function startDevServer() {
  const app = express();

  app.use(express.json());

  // Serve styles if needed (dev only)
  app.use('/src/styles', express.static(path.resolve(__dirname, 'src/styles')));

  // PDF export route
  const { exportPdfMiddleware } = await import(
    path.resolve(__dirname, 'src/server/exportPdfMiddleware.js')
  );
  app.post('/api/export-pdf', exportPdfMiddleware);

  // Test route
  app.get('/api/test-proxy', (req, res) => {
    res.send('Proxy working');
  });

  // ✅ Return list of templates for a customer
  app.get("/api/templates/:customerId", (req, res) => {
    const { customerId } = req.params;

    const customerTemplatePath = getCustomerTemplatePath(customerId);
    const customerManifestPath = getCustomerManifestPath(customerId);

    fs.readdir(customerTemplatePath, (err, files) => {
      if (err || !files || files.length === 0) {
        logDebug("getTemplates.noFiles", {
          customerId,
          error: err ? err.message : null,
        });
        return res.json({ templates: [] });
      }

      const templates = files
        .filter((f) => {
          const ext = path.extname(f).toLowerCase();
          return allowedExtensions.has(ext);
        })
        .map((f) => {
          const id = path.parse(f).name;
          const manifestPath = path.join(
            customerManifestPath,
            `${id}.manifest.json`
          );
          const hasManifest = fs.existsSync(manifestPath);

          return {
            id,
            name: f,
            hasManifest,
          };
        });

      logDebug("getTemplates.success", {
        customerId,
        templateCount: templates.length,
        templates: templates.map((t) => ({
          id: t.id,
          hasManifest: t.hasManifest,
        })),
      });

      return res.json({ templates });
    });
  });

  // Configure multer for file uploads
  const upload = multer({ dest: path.join(storageBasePath, 'tmp') });

  interface MulterRequest extends Request {
    file?: Express.Multer.File;
  }

  // ✅ Upload a new template for a customer
  app.post(
    "/api/templates/:customerId/upload",
    upload.single("file"),
    async (req: MulterRequest, res) => {
      const { customerId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.has(ext)) {
        return res.status(400).json({
          error: "Unsupported file type - only DOCX and PDF are supported.",
        });
      }

      // Save original into _seed/
      const customerSeedPath = path.join(storageBasePath, customerId, "_seed");
      fs.mkdirSync(customerSeedPath, { recursive: true });
      const seedPath = path.join(customerSeedPath, file.originalname);
      fs.copyFileSync(file.path, seedPath);

      try {
        const templateId = path.parse(file.originalname).name;

        // Read file into Buffer
        const buffer = fs.readFileSync(seedPath);

        // Run prebuilt-read
        const readPoller = await formRecClient.beginAnalyzeDocument(
          "prebuilt-read",
          buffer
        );
        const readResult = await readPoller.pollUntilDone();

        logDebug("upload.prebuiltRead", {
          preview: readResult.content?.slice(0, 500),
        });
        logAllReadFields(readResult);

        // Extract candidates
        const { candidates: readCandidates } = deriveCandidatesFromRead(readResult);

        // Merge + sort
        const mergedCandidates = mergeCandidates(readCandidates);
        const orderedCandidates = sortCandidatesByDocumentOrder(mergedCandidates);

        // Save candidates in session store keyed by templateId
        await saveCandidates(`candidates:${templateId}`, orderedCandidates);

        // Return the extracted candidates for UI mapping
        return res.json({
          templateId,
          name: file.originalname,
          candidates: orderedCandidates,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          logDebug("upload.error", { message: err.message, stack: err.stack });
          return res.status(500).json({
            error: "Failed to analyze template",
            details: err.message,
          });
        } else {
          logDebug("upload.error", { error: String(err) });
          return res.status(500).json({
            error: "Failed to analyze template",
            details: String(err),
          });
        }
      } finally {
        // Always attempt to clean up the tmp file
        if (file?.path) {
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) {
              logDebug("upload.cleanupFailed", {
                tmpFile: file.path,
                error: unlinkErr.message,
              });
            } else {
              logDebug("upload.cleanupSuccess", { tmpFile: file.path });
            }
          });
        }
      }
    }
  );

  // Confirm mapping for a template
  app.post(
    "/api/templates/:customerId/:templateId/confirm-mapping",
    async (req, res) => {
      const { customerId, templateId } = req.params;
      const mapping = req.body as NormalizedMapping[];

      if (!Array.isArray(mapping) || mapping.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "No mapping provided" });
      }

      // 🔹 Validate required fields
      const valid = mapping.every(
        (m) =>
          typeof m.raw === "string" &&
          m.raw.trim() !== "" &&
          typeof m.schemaField === "string" &&
          m.schemaField.trim() !== "" &&
          typeof m.placeholder === "string" &&
          m.placeholder.trim() !== ""
      );
      if (!valid) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid mapping format" });
      }

      const manifest = {
        templateId,
        customerId,
        createdAt: new Date().toISOString(),
        variables: mapping.map((m) => ({
          raw: m.raw,
          normalized: m.normalized,
          schemaField: m.schemaField,
          placeholder: m.placeholder,
        })),
      };

      try {
        // 1. Save manifest
        const customerManifestPath = getCustomerManifestPath(customerId);
        await fs.promises.mkdir(customerManifestPath, { recursive: true });
        const manifestPath = path.join(
          customerManifestPath,
          `${templateId}.manifest.json`
        );
        await fs.promises.writeFile(
          manifestPath,
          JSON.stringify(manifest, null, 2)
        );

        logDebug("confirmMapping.manifestSaved", {
          manifestPath,
          templateId,
          customerId,
        });

        // 2. Load original seed file
        const customerSeedPath = path.join(storageBasePath, customerId, "_seed");
        const seedFilePathDocx = path.join(customerSeedPath, `${templateId}.docx`);
        const seedFilePathPdf = path.join(customerSeedPath, `${templateId}.pdf`);
        const seedFilePath = fs.existsSync(seedFilePathDocx)
          ? seedFilePathDocx
          : seedFilePathPdf;
        const buffer = await fs.promises.readFile(seedFilePath);
        const ext = path.extname(seedFilePath).toLowerCase();

        // 3. Load stored candidates from sessionStore
        const stored = await loadCandidates(`candidates:${templateId}`);
        if (!stored) {
          return res.status(400).json({
            success: false,
            error: "No stored candidates found for this templateId",
          });
        }

        // 4. Merge NormalizedMapping[] into stored candidates
        const enrichedCandidates = mergeMappingWithCandidates(mapping, stored);

        // 5. Placeholderize with enriched candidates
        const { placeholderBuffer } = await placeholderizeDocument(
          buffer,
          enrichedCandidates,
          ext
        );

        // 6. Save placeholderized copy
        const customerTemplatePath = path.join(
          storageBasePath,
          customerId,
          "templates"
        );
        await fs.promises.mkdir(customerTemplatePath, { recursive: true });
        const templatePath = path.join(
          customerTemplatePath,
          `${templateId}${ext}`
        );
        await fs.promises.writeFile(templatePath, placeholderBuffer);

        // 7. Clean up session store
        await deleteCandidates(`candidates:${templateId}`);

        logDebug("confirmMapping.placeholderized", {
          templatePath,
          placeholders: enrichedCandidates
            .filter((c) => c.placeholder)
            .map((c) => ({ field: c.schemaField, placeholder: c.placeholder })),
        });

        return res.json({
          success: true,
          placeholders: enrichedCandidates,
        });
      } catch (err) {
        logDebug("confirmMapping.error", {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        return res.status(500).json({
          success: false,
          error: "Failed to save manifest/placeholderize",
        });
      }
    }
  );

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      root: path.resolve(root, "expert-snapshot-legal/frontend"),
    });

    app.use(vite.middlewares);
  } else {
    logDebug("server.staticConfig", {
      frontendBuildPath,
      indexExists: fs.existsSync(indexPath),
    });

    // Serve static assets
    app.use(express.static(frontendBuildPath));

    // ✅ SPA fallback for React Router
    app.get("*", (req, res) => {
      logDebug("server.frontendRoute", { url: req.url });
      res.sendFile(indexPath);
    });
  }

  app.listen(3001, "127.0.0.1", () => {
    logDebug("server.started", {
      url: "http://localhost:3001",
      mode: isDev ? "development" : "production",
      azureEndpoint: process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
    });
  });
}

startDevServer();
