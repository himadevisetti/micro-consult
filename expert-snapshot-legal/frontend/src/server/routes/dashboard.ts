// src/server/routes/dashboard.ts

import { Router } from "express";
import { logDebug, logError } from "../../utils/logger.js";
import { findDocumentsByCustomer } from "../../models/DocumentRepository.js";
import { RETENTION_DAYS } from "../config.js";
import type { DocumentRow } from "@/types/DocumentRow";

const router = Router();

/**
 * GET /api/dashboard/:customerId
 * Returns all final deliverables (docx/pdf) for the given customer within retention window
 */
router.get("/dashboard/:customerId", async (req, res) => {
  const { customerId } = req.params;

  try {
    const docs: DocumentRow[] = await findDocumentsByCustomer(customerId, RETENTION_DAYS);

    // Only include final deliverables uploaded to Azure Blob (docx or pdf)
    const finalDocs = docs.filter(
      doc => doc.storageType === "AzureBlob" && ["pdf", "docx"].includes(doc.documentType)
    );

    const payload = finalDocs.map(doc => ({
      id: doc.id,
      customerId: doc.customerId,
      fileName: doc.fileName,
      fileSize: doc.fileSize ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt ?? null,
    }));

    logDebug("dashboard.success", {
      customerId,
      count: payload.length,
      retentionDays: RETENTION_DAYS,
    });

    return res.json({ success: true, documents: payload });
  } catch (err: any) {
    logError("dashboard.error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;
