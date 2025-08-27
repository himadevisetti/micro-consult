export function getPrintableHtml(clauseHtmlMap) {
    return `
    <h2 class="retainerTitle">STANDARD RETAINER AGREEMENT</h2>
    <div class="clausesFlow">
      ${Object.values(clauseHtmlMap).join('\n')}
    </div>
  `;
}
