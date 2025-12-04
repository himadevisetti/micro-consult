// src/server/routes/dashboard.ts

import { Router } from "express";
import { logDebug, logError } from "../../utils/logger.js";
import { findDocumentsByCustomer } from "../../models/DocumentRepository.js";
import { RETENTION_DAYS } from "../config.js";
import type { DocumentRow } from "@/types/DocumentRow";
import { track } from "../../../track.js";

const router = Router();

/**
 * GET /api/dashboard/:customerId
 * Returns all final deliverables (docx/pdf) for the given customer within retention window
 */
router.get("/dashboard/:customerId", async (req, res) => {
  const { customerId } = req.params;

  try {
    // Step 1: Lookup all documents for customer within retention window
    const docs: DocumentRow[] = await findDocumentsByCustomer(customerId, RETENTION_DAYS);

    // Step 2: Filter only final deliverables uploaded to Azure Blob (docx or pdf)
    const finalDocs = docs.filter(
      doc => doc.storageType === "AzureBlob" && ["pdf", "docx"].includes(doc.documentType)
    );

    // Step 3: Shape payload for frontend consumption
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

    // 🔹 Telemetry event for dashboard view
    await track("dashboard_viewed", {
      customerId,
      documentCount: payload.length,
      retentionDays: RETENTION_DAYS,
    });

    // Step 4: Return success response with documents
    return res.json({ success: true, documents: payload });
  } catch (err: any) {
    // Step 5: Error handling with structured logs + consistent response shape
    logError("dashboard.error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ success: false, error: "Failed to load dashboard" });
  }
});

export default router;
