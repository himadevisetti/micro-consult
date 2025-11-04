// src/server/injectCssIntoHtml.ts

import { MONTH_KEYWORDS } from "../constants/contractKeywords.js";

/**
 * Injects compiled CSS into raw HTML for PDF rendering,
 * and bakes in `.signature-break` on the "Signatures" clauseBlock.
 */
export function injectCssIntoHtml(
  html: string,
  compiledCss: string,
  title: string
): string {
  const escapedCss = compiledCss.replace(/<\/style>/gi, "<\\/style>");

  // Regex: Month + day + year → replace spaces with &nbsp;
  const monthPattern = MONTH_KEYWORDS.join("|");
  const htmlWithNbsp = html.replace(
    new RegExp(`\\b(${monthPattern})\\s+(\\d{1,2}),\\s+(\\d{4})`, "gi"),
    (_, month, day, year) => `${month}&nbsp;${day},&nbsp;${year}`
  );

  const htmlTagged = htmlWithNbsp.replace(
    /(<div[^>]*class=")([^"]*__clauseBlock___[A-Za-z0-9_-]*[^"]*)("[^>]*>)(?:(?!<\/div>)[\s\S])*?(<br><br>[\s\S]*?<h3[^>]*>\s*Signatures\s*<\/h3>)/i,
    "$1$2 signature-break$3$4"
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          ${escapedCss}

          @page { margin: 1.75in 1in 1in 1in; }

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
          .clauseBlock h3 { font-size: 18px; margin: 8px 0 24px 0; color: #333; }
          .clauseBlock p  { font-size: 16px; margin: 0 0 24px 0; }

          @media print {
            html, body { height: auto !important; overflow: visible !important; }
            p { widows: 1; orphans: 1; }

            .clauseBlock { page-break-inside: auto !important; break-inside: auto !important; }

            /* Keep clause heading with first paragraph */
            .clauseBlock h3 { break-after: avoid-page !important; page-break-after: avoid !important; }
            .clauseBlock h3 + p { break-before: avoid-page !important; page-break-before: avoid !important; }

            /* Signature clause special rules */
            .signature-break {
              break-inside: auto !important;
              page-break-inside: auto !important;
              overflow: visible !important;
              display: block !important;
            }
            .signature-break h3 {
              break-after: avoid-page !important;
              page-break-after: avoid !important;
            }
            .signature-break h3 + p {
              break-before: avoid-page !important;
              page-break-before: avoid !important;
            }
            /* Keep underline with the following name and title */
            .signature-break p:has(+ p strong) {
              break-after: avoid-page !important;
              page-break-after: avoid !important;
            }
            .signature-break p:has(+ p strong) + p {
              break-before: avoid-page !important;
              page-break-before: avoid !important;
              break-inside: avoid-page !important;
              page-break-inside: avoid !important;
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
