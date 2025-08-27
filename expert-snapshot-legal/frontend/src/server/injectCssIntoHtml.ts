/**
 * Injects compiled CSS into raw HTML for PDF rendering.
 */
export function injectCssIntoHtml(html: string, compiledCss: string): string {
  const escapedCss = compiledCss.replace(/<\/style>/gi, '<\\/style>');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>STANDARD RETAINER AGREEMENT</title>
        <style>
          ${escapedCss}

          @page {
            margin: 1.75in 1in;
          }

          html, body {
            font-family: 'Georgia', serif;
            font-size: 14px;
            line-height: 1.6;
            color: #000;
            margin: 0;
          }

          .retainerTitle {
            text-align: center;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 24px;
            text-transform: uppercase;
            letter-spacing: 1px;
            page-break-after: avoid;
          }

          .clausesFlow {
            margin: 0;
          }

          .clauseBlock {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }

          .clauseBlock:last-of-type {
            margin-bottom: 0px;
          }

          .clauseBlock:last-of-type p:last-of-type {
            margin-bottom: 4px;
          }

          .clauseBlock h3 {
            font-size: 18px;
            margin: 8px 0 24px 0;
            color: #333;
          }

          .clauseBlock p {
            font-size: 16px;
            margin: 0 0 24px 0;
          }

          .signatureBlock {
            margin: 0;
            page-break-inside: avoid;
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
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
}
