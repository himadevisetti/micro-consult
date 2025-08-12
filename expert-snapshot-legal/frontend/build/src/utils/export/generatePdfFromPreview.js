import puppeteer from 'puppeteer';
import { injectCssIntoHtml } from '../../server/injectCssIntoHtml.js';
import { findCompiledCss } from '../findCompiledCss.js';
export async function generatePdfFromPreview(html) {
    // Load compiled CSS from Vite build
    const compiledCss = findCompiledCss();
    // Inject CSS into raw HTML
    const styledHtml = injectCssIntoHtml(html, compiledCss);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
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
