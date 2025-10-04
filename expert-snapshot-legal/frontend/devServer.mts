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
} from "./src/utils/candidateUtils.js";
import { NormalizedMapping } from './src/types/confirmMapping.js';

// load .env at startup
dotenv.config();

// then override with .env.local if present
dotenv.config({ path: ".env.local", override: true });

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
  app.get('/api/templates/:customerId', (req, res) => {
    const { customerId } = req.params;

    const customerTemplatePath = getCustomerTemplatePath(customerId);
    const customerManifestPath = getCustomerManifestPath(customerId);

    fs.readdir(customerTemplatePath, (err, files) => {
      if (err || !files || files.length === 0) {
        return res.json({ templates: [] });
      }

      const templates = files
        .filter((f) => {
          const ext = path.extname(f).toLowerCase();
          return allowedExtensions.has(ext);
        })
        .map((f) => {
          const id = path.parse(f).name;
          const manifestPath = path.join(customerManifestPath, `${id}.manifest.json`);
          const hasManifest = fs.existsSync(manifestPath);

          return {
            id,
            name: f,
            hasManifest, // ✅ now checks the correct folder
          };
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

      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.has(ext)) {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      const customerTemplatePath = path.join(storageBasePath, customerId, "templates");
      fs.mkdirSync(customerTemplatePath, { recursive: true });
      const destPath = path.join(customerTemplatePath, file.originalname);

      try {
        fs.copyFileSync(file.path, destPath);
        const templateId = path.parse(file.originalname).name;

        // Read file into Buffer
        const buffer = fs.readFileSync(destPath);

        // 🔹 Run prebuilt-read only
        const readPoller = await formRecClient.beginAnalyzeDocument(
          "prebuilt-read",
          buffer
        );
        const readResult = await readPoller.pollUntilDone();

        const debug = process.env.DEBUG_CONTRACTS === "true";
        if (debug) {
          console.log("DEBUG: Full prebuilt-read content:", readResult.content?.slice(0, 500), "...");
          logAllReadFields(readResult);
        }

        // 🔹 Extract candidates from prebuilt-read
        const readCandidates = deriveCandidatesFromRead(readResult);

        // 🔹 Merge + sort (still useful for deduplication and ordering)
        const mergedCandidates = mergeCandidates(readCandidates);
        const orderedCandidates = sortCandidatesByDocumentOrder(mergedCandidates);

        return res.json({
          templateId,
          name: file.originalname,
          candidates: orderedCandidates,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Azure analysis failed:", err.message, err.stack);
          return res
            .status(500)
            .json({ error: "Failed to analyze template", details: err.message });
        } else {
          console.error("Azure analysis failed with non-Error:", err);
          return res
            .status(500)
            .json({ error: "Failed to analyze template", details: String(err) });
        }
      }
    }
  );

  // Confirm mapping for a template
  app.post('/api/templates/:customerId/:templateId/confirm-mapping', async (req, res) => {
    const { customerId, templateId } = req.params;
    const mapping = req.body as NormalizedMapping[];

    if (!Array.isArray(mapping) || mapping.length === 0) {
      return res.status(400).json({ success: false, error: 'No mapping provided' });
    }

    const valid = mapping.every(
      (m) =>
        typeof m.raw === 'string' &&
        m.raw.trim() !== '' &&
        typeof m.schemaField === 'string' &&
        m.schemaField.trim() !== ''
    );

    if (!valid) {
      return res.status(400).json({ success: false, error: 'Invalid mapping format' });
    }

    const manifest = {
      templateId,
      customerId,
      createdAt: new Date().toISOString(),
      variables: mapping,
    };

    try {
      const customerManifestPath = getCustomerManifestPath(customerId);
      await fs.promises.mkdir(customerManifestPath, { recursive: true });

      const manifestPath = path.join(customerManifestPath, `${templateId}.manifest.json`);
      await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Failed to save manifest' });
    }
  });

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      root: path.resolve(root, 'expert-snapshot-legal/frontend'),
    });

    app.use(vite.middlewares);
  } else {
    console.log('📦 Serving static from:', frontendBuildPath);
    console.log('📄 Index exists:', fs.existsSync(indexPath));

    // Serve static assets
    app.use(express.static(frontendBuildPath));

    // ✅ SPA fallback for React Router
    app.get('*', (req, res) => {
      console.log('🌐 Frontend route hit:', req.url);
      res.sendFile(indexPath);
    });
  }

  app.listen(3001, '127.0.0.1', () => {
    console.log(`✅ Express server running at http://localhost:3001`);
    console.log(`🌍 Mode: ${isDev ? 'development' : 'production'}`);
    console.log(`🔑 Using Azure endpoint: ${process.env.AZURE_FORM_RECOGNIZER_ENDPOINT}`);
  });
}

startDevServer();
