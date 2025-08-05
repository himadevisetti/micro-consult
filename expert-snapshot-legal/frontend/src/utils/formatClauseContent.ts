import { load } from 'cheerio';

export function formatClauseContent(html: string): { text: string; bold?: boolean }[] {
  const $ = load(html);
  const lines: { text: string; bold?: boolean }[] = [];

  $('h3, p').each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    if ($(el).is('h3')) {
      lines.push({ text, bold: true }); // Treat <h3> as bold title
    } else {
      lines.push({ text });
    }
  });

  return lines;
}
