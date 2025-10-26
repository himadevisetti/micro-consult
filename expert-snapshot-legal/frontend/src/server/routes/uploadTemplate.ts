// src/server/routes/uploadTemplate.ts
import { Router, Request } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { logDebug } from "../../utils/logger.js";
import {
  allowedExtensions,
  storageBasePath,
  formRecClient,
} from "../config.js";
import { mergeCandidates } from "../../utils/candidates/mergeCandidates.js";
import { sortCandidatesByDocumentOrder } from "../../utils/candidates/sortCandidatesByDocumentOrder.js";
import { deriveCandidatesFromRead } from "../../utils/candidates/deriveCandidatesFromRead.js";
import { saveCandidates } from "../../infrastructure/sessionStore.js";
import { logAllReadFields } from "../../utils/candidates/logAllReadFields.js";

const router = Router();

// Configure multer for file uploads (tmp folder under storageBasePath)
const upload = multer({ dest: path.join(storageBasePath, "tmp") });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Upload template route
router.post(
  "/templates/:customerId/upload",
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

      // Extract candidates + clauseBlocks
      const { candidates: readCandidates, clauseBlocks } =
        deriveCandidatesFromRead(readResult);

      // Merge + sort
      const mergedCandidates = mergeCandidates(readCandidates);
      const orderedCandidates = sortCandidatesByDocumentOrder(mergedCandidates);

      // Save both candidates and clauseBlocks in session store keyed by templateId
      await saveCandidates(`candidates:${templateId}`, {
        candidates: orderedCandidates,
        clauseBlocks,
      });

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

export default router;
