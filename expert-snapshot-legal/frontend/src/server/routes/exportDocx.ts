// src/server/routes/exportDocx.ts

import { Router } from "express";
import { logDebug, logError } from "../../utils/logger.js";
import { generateDOCX } from "../../utils/export/generateDOCX.js";
import { uploadToAzureBlob } from "../utils/uploadToAzureBlob.js";
import { track } from "../../../track.js"

const router = Router();

router.post("/exportDocx", async (req, res) => {
  logDebug("exportDocx.request.received", {
    keys: Object.keys(req.body || {}),
    filename: req.body?.filename,
    hasHtml: typeof req.body?.html === "string",
  });

  const { html, filename, customerId = "default" } = req.body as {
    html?: string;
    filename?: string;
    customerId?: string;
  };
  const resolvedFilename = filename || "retainer.docx";

  if (!html || typeof html !== "string") {
    logError("exportDocx.invalidHtml", { htmlType: typeof html });
    return res.status(400).json({ error: "Invalid HTML payload" });
  }

  try {
    // 🔹 Track document generation
    await track("document_generated", {
      format: "docx",
      flowName: "ExportDocxRoute",
      filename: resolvedFilename,
      customerId,
    });

    logDebug("exportDocx.branch.html", {
      filename: resolvedFilename,
      htmlPreview: html.slice(0, 80),
    });

    const blob = await generateDOCX({ html, filename: resolvedFilename });
    logDebug("exportDocx.docxGenerated", { size: blob.size });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const blobUrl = await uploadToAzureBlob(
      buffer,
      resolvedFilename,
      customerId,
      "docx", // documentType
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    logDebug("exportDocx.uploadedToAzure", { blobUrl });

    // 🔹 Track document download
    await track("document_downloaded", {
      format: "docx",
      flowName: "ExportDocxRoute",
      filename: resolvedFilename,
      customerId,
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${resolvedFilename}"`);
    res.setHeader("Content-Length", buffer.length);
    res.end(buffer);
  } catch (err) {
    logError("exportDocx.error", {
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to generate DOCX" });
  }
});

export default router;
