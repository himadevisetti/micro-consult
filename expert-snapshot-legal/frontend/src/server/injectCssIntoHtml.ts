/**
 * Injects compiled CSS into raw HTML for PDF rendering.
 * - Tags the "Signatures" <h3> in-string with data-signatures (no JS).
 * - Scopes print rules to the section containing that heading.
 */
export function injectCssIntoHtml(html: string, compiledCss: string, title: string): string {
  const escapedCss = compiledCss.replace(/<\/style>/gi, '<\\/style>');

  // Tag the Signatures heading so we can target it in CSS without JS.
  // Keeps any existing attributes on <h3>.
  const htmlTagged = html.replace(
    /(<h3)([^>]*>)\s*Signatures\s*(<\/h3>)/i,
    (_m, open, rest, close) => `${open} data-signatures="true"${rest}Signatures${close}`
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          ${escapedCss}

          /* Page margins: top 1.75in, sides 1in, bottom 1in */
          @page {
            margin: 1.75in 1in 1in 1in;
          }

          html, body {
            font-family: 'Georgia', serif;
            font-size: 14px;
            line-height: 1.6;
            color: #000;
            margin: 0;
            background-color: white;
          }

          .retainerTitle {
            text-align: center;
            font-size: 24px;
            margin: 0 0 24px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            page-break-after: avoid;
          }

          .clausesFlow { margin: 0; }

          .clauseBlock {
            margin-bottom: 24px;
            page-break-inside: auto;
          }
          .clauseBlock:last-of-type { margin-bottom: 0; }
          .clauseBlock:last-of-type p:last-of-type { margin-bottom: 4px; }
          .clauseBlock h3 {
            font-size: 18px;
            margin: 8px 0 24px 0;
            color: #333;
          }
          .clauseBlock p {
            font-size: 16px;
            margin: 0 0 24px 0;
          }

          /* Signature section container — allow breaks before it */
          .signatureBlock {
            margin: 0;
            break-inside: auto;
            page-break-inside: auto;
          }
          .signatureBlock p {
            font-size: 16px;
            margin: 0;
          }

          @media print {
            html, body {
              height: auto !important;
              overflow: visible !important;
            }
            p { widows: 1; orphans: 1; }

            .clauseBlock {
              page-break-inside: auto !important;
              break-inside: auto !important;
            }

            /* Keep every clause heading with its first paragraph */
            .clauseBlock h3 {
              break-after: avoid-page !important;
              page-break-after: avoid !important;
            }
            .clauseBlock h3 + p {
              break-before: avoid-page !important;
              page-break-before: avoid !important;
            }

            /* Signature clause special rules (scoped to the section with the tagged heading) */
            section:has(> h3[data-signatures]) {
              break-inside: auto !important;
              page-break-inside: auto !important;
              overflow: visible !important;
              display: block !important;
            }

            /* Keep Signatures heading with intro paragraph */
            h3[data-signatures] {
              break-after: avoid-page !important;
              page-break-after: avoid !important;
            }
            h3[data-signatures] + p {
              break-before: avoid-page !important;
              page-break-before: avoid !important;
              break-inside: avoid-page !important;
              page-break-inside: avoid !important;
            }

            /* Keep the IN WITNESS WHEREOF line intact (same as the intro p above) */
            /* Already covered by h3[data-signatures] + p rules */

            /* Keep underline with following name/title, push both down if needed */
            section:has(> h3[data-signatures]) p:has(+ p strong) {
              break-inside: avoid-page !important;
              page-break-inside: avoid !important;
            }
            section:has(> h3[data-signatures]) p strong {
              break-before: avoid-page !important;
              page-break-before: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        ${htmlTagged}
      </body>
    </html>
  `;
}
