// src/server/routes/exportPdf.ts
import { Router } from "express";
import { renderHtmlToPdf } from "../utils/renderHtmlToPdf.js";
import { convertDocxToPdf } from "../utils/convertDocxToPdf.js";
import { logDebug, logError } from "../../utils/logger.js";

const router = Router();

router.post("/exportPdf", async (req, res) => {
  logDebug("exportPdf.request.received", {
    keys: Object.keys(req.body || {}),
    filename: req.body?.filename,
    hasHtml: typeof req.body?.html === "string",
    hasDocxBuffer: !!req.body?.docxBufferBase64,
  });

  const { html, filename, docxBufferBase64 } = req.body as {
    html?: string;
    filename?: string;
    docxBufferBase64?: string;
  };
  const resolvedFilename = filename || "retainer.pdf";

  try {
    if (docxBufferBase64) {
      logDebug("exportPdf.branch.docx", { filename: resolvedFilename });
      const mergedBuffer = Buffer.from(docxBufferBase64, "base64");
      const pdfBuffer = await convertDocxToPdf(mergedBuffer);
      logDebug("exportPdf.success.docx", { size: pdfBuffer.length });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${resolvedFilename}"`);
      return res.send(pdfBuffer);
    }

    if (!html || typeof html !== "string") {
      logError("exportPdf.invalidHtml", { htmlType: typeof html });
      return res.status(400).json({ error: "Invalid HTML payload" });
    }

    logDebug("exportPdf.branch.html", {
      filename: resolvedFilename,
      htmlPreview: html.slice(0, 80),
    });
    const pdfBuffer = await renderHtmlToPdf(html);
    logDebug("exportPdf.success.html", { size: pdfBuffer.length });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${resolvedFilename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    logError("exportPdf.error", {
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
