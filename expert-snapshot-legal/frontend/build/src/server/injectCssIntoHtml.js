/**
 * Injects compiled CSS into raw HTML for PDF rendering.
 */
export function injectCssIntoHtml(html, compiledCss) {
    const escapedCss = compiledCss.replace(/<\/style>/gi, '<\\/style>');
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Legal Retainer Agreement</title>
        <style>
          body {
            margin: 0;
            font-family: 'Georgia', serif;
          }
          ${escapedCss}
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
}
