import puppeteer from 'puppeteer';
import { injectCssIntoHtml } from '../../server/injectCssIntoHtml.js';
import { findCompiledCss } from '../findCompiledCss.js';
import { extractTitleFromHtml } from '../formatTitle.js';

export async function generatePdfFromPreview(html: string): Promise<Uint8Array> {
  // Load compiled CSS from Vite build
  const compiledCss = findCompiledCss();

  const title = extractTitleFromHtml(html) ?? 'RETAINER AGREEMENT';

  // Inject CSS into raw HTML
  const styledHtml = injectCssIntoHtml(html, compiledCss, title);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(styledHtml, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '1in',
      bottom: '1in',
      left: '1in',
      right: '1in',
    },
  });

  await browser.close();

  // Ensure it's a Node Buffer
  return Buffer.from(pdfBuffer);
}
