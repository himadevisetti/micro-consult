// src/server/routes/download.ts

import { Router } from "express";
import { BlobClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { logDebug, logError } from "../../utils/logger.js";
import { findDocumentById } from "../../models/DocumentRepository.js";
import { RETENTION_DAYS } from "../config.js";
import { track } from "../../../track.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = Router();

/**
 * GET /api/download/:customerId/:docId
 * Secure download route for AzureBlob documents only
 */
router.get("/download/:customerId/:docId", authenticateToken, async (req, res) => {
  const { customerId, docId } = req.params;

  try {
    // Step 1: Lookup document by customer + ID within retention window
    const doc = await findDocumentById(customerId, Number(docId), RETENTION_DAYS);
    if (!doc) {
      return res.status(404).json({ success: false, error: "Document not found or expired" });
    }

    // Step 2: Validate storage type
    if (doc.storageType !== "AzureBlob") {
      return res.status(400).json({ success: false, error: "Unsupported storage type" });
    }

    logDebug("download.request", { customerId, docId, filePath: doc.filePath });

    // Step 3: Set headers for secure download
    res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    // Step 4: RBAC-authenticated blob streaming using DefaultAzureCredential
    const credential = new DefaultAzureCredential();
    const blobClient = new BlobClient(doc.filePath, credential);

    logDebug("download.lookup", { blobClientUrl: blobClient.url });

    // 🔹 Telemetry event for successful download initiation
    await track("document_downloaded", {
      customerId,
      docId,
      fileName: doc.fileName,
      fileSize: doc.fileSize ?? 0,
    });

    // Step 5: Stream blob contents to response
    const downloadResponse = await blobClient.download();
    downloadResponse.readableStreamBody?.pipe(res);

  } catch (err: any) {
    // Step 6: Error handling with structured logs + consistent response shape
    logError("download.error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ success: false, error: "Failed to download document" });
  }
});

export default router;
