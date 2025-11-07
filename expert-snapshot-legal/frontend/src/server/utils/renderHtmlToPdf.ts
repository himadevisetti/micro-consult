// src/server/utils/renderHtmlToPdf.ts

import puppeteer from "puppeteer";
import { injectCssIntoHtml } from "../injectCssIntoHtml.js";
import { findCompiledCss } from "../../utils/findCompiledCss.js";
import { extractTitleFromHtml } from "../../utils/formatTitle.js";
import { logDebug } from "../../utils/logger.js";

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  logDebug("renderHtmlToPdf.start", {
    htmlPreview: html.slice(0, 120), // preview only, avoid logging full HTML
  });

  const compiledCss = findCompiledCss();
  const title = extractTitleFromHtml(html) ?? "RETAINER AGREEMENT";
  logDebug("renderHtmlToPdf.metadata", { title, cssLength: compiledCss.length });

  const styledHtml = injectCssIntoHtml(html, compiledCss, title);

  const browser = await puppeteer.launch({ headless: true });
  logDebug("renderHtmlToPdf.browserLaunched");

  const page = await browser.newPage();
  await page.setContent(styledHtml, { waitUntil: "networkidle0" });
  logDebug("renderHtmlToPdf.pageContentSet", {
    contentLength: styledHtml.length,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "1in", bottom: "1in", left: "1in", right: "1in" },
  });
  logDebug("renderHtmlToPdf.pdfGenerated", { size: pdfBuffer.length });

  await browser.close();
  logDebug("renderHtmlToPdf.browserClosed");

  return Buffer.from(pdfBuffer);
}
