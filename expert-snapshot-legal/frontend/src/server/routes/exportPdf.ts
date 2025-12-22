// src/server/routes/exportPdf.ts
// -----------------------------
// Route: /exportPdf
// -----------------------------
// Converts styled HTML to PDF using Puppeteer and uploads to Azure Blob.
// This version uses puppeteer-core and an explicit Chrome binary path for Azure compatibility.

import { Router } from "express";
import puppeteer from "puppeteer-core";
import { injectCssIntoHtml } from "../injectCssIntoHtml.js";
import { findCompiledCss } from "../../utils/findCompiledCss.js";
import { extractTitleFromHtml } from "../../utils/formatTitle.js";
import { logDebug, logError } from "../../utils/logger.js";
import { uploadToAzureBlob } from "../utils/uploadToAzureBlob.js";
import { track } from "../../../track.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = Router();

router.post("/exportPdf", authenticateToken, async (req, res) => {
  logDebug("exportPdf.request.received", {
    keys: Object.keys(req.body || {}),
    filename: req.body?.filename,
    hasHtml: typeof req.body?.html === "string",
  });

  const { html, filename, customerId = "default" } = req.body as {
    html?: string;
    filename?: string;
    customerId?: string;
  };
  const resolvedFilename = filename || "retainer.pdf";

  if (!html || typeof html !== "string") {
    logError("exportPdf.invalidHtml", { htmlType: typeof html });
    return res.status(400).json({ error: "Invalid HTML payload" });
  }

  try {
    // 🔹 Track document generation
    await track("document_generated", {
      format: "pdf",
      flowName: "ExportPdfRoute",
      filename: resolvedFilename,
      customerId,
    });

    logDebug("exportPdf.branch.html", {
      filename: resolvedFilename,
      htmlPreview: html.slice(0, 80),
    });

    const compiledCss = findCompiledCss();
    const title = extractTitleFromHtml(html) ?? "RETAINER AGREEMENT";
    logDebug("exportPdf.metadata", { title, cssLength: compiledCss.length });

    const styledHtml = injectCssIntoHtml(html, compiledCss, title);

    // Launch Puppeteer with explicit Chrome path
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    logDebug("exportPdf.browserLaunched");

    const page = await browser.newPage();
    await page.setContent(styledHtml, { waitUntil: "networkidle0" });
    logDebug("exportPdf.pageContentSet", {
      contentLength: styledHtml.length,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "1in", bottom: "1in", left: "1in", right: "1in" },
    });
    logDebug("exportPdf.pdfGenerated", { size: pdfBuffer.length });

    await browser.close();
    logDebug("exportPdf.browserClosed");

    const blobUrl = await uploadToAzureBlob(
      Buffer.from(pdfBuffer),
      resolvedFilename,
      customerId,
      "pdf", // documentType
      "application/pdf"
    );
    logDebug("exportPdf.uploadedToAzure", { blobUrl });

    // 🔹 Track document download
    await track("document_downloaded", {
      format: "pdf",
      flowName: "ExportPdfRoute",
      filename: resolvedFilename,
      customerId,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${resolvedFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (err) {
    logError("exportPdf.error", {
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
