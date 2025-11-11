import { Router } from "express";
import puppeteer from "puppeteer";
import { injectCssIntoHtml } from "../injectCssIntoHtml.js";
import { findCompiledCss } from "../../utils/findCompiledCss.js";
import { extractTitleFromHtml } from "../../utils/formatTitle.js";
import { logDebug, logError } from "../../utils/logger.js";

const router = Router();

router.post("/exportPdf", async (req, res) => {
  logDebug("exportPdf.request.received", {
    keys: Object.keys(req.body || {}),
    filename: req.body?.filename,
    hasHtml: typeof req.body?.html === "string",
  });

  const { html, filename } = req.body as {
    html?: string;
    filename?: string;
  };
  const resolvedFilename = filename || "retainer.pdf";

  if (!html || typeof html !== "string") {
    logError("exportPdf.invalidHtml", { htmlType: typeof html });
    return res.status(400).json({ error: "Invalid HTML payload" });
  }

  try {
    logDebug("exportPdf.branch.html", {
      filename: resolvedFilename,
      htmlPreview: html.slice(0, 80),
    });

    const compiledCss = findCompiledCss();
    const title = extractTitleFromHtml(html) ?? "RETAINER AGREEMENT";
    logDebug("exportPdf.metadata", { title, cssLength: compiledCss.length });

    const styledHtml = injectCssIntoHtml(html, compiledCss, title);

    const browser = await puppeteer.launch({ headless: true });
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
