export function getPrintableHtml(clauseHtmlMap: Record<string, string>): string {
  return `
    <h2 class="retainerTitle">STANDARD RETAINER AGREEMENT</h2>
    <div class="clausesFlow">
      ${Object.values(clauseHtmlMap).join('\n')}
    </div>
  `;
}

