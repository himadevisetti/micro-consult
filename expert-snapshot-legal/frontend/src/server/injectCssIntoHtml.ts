/**
 * Injects compiled CSS into raw HTML for PDF rendering.
 */
export function injectCssIntoHtml(html: string, compiledCss: string, title: string): string {
  const escapedCss = compiledCss.replace(/<\/style>/gi, '<\\/style>');

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

            /* Keep clause heading with first paragraph */
            .clauseBlock h3 {
              break-after: avoid-page !important;
              page-break-after: avoid !important;
            }
            .clauseBlock h3 + p {
              break-before: avoid-page !important;
              page-break-before: avoid !important;
            }

            /* Allow breaks only inside the clauseBlock containing the Signatures heading */
            .print-allow-break {
              break-inside: auto !important;
              page-break-inside: auto !important;
            }
          }
        </style>
        <script>
          // Tag the clauseBlock containing the "Signatures" heading
          document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.clauseBlock').forEach(block => {
              const heading = block.querySelector('section > h3, h3');
              if (heading && heading.textContent.trim().toLowerCase() === 'signatures') {
                block.classList.add('print-allow-break');
              }
            });
          });
        </script>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
}
