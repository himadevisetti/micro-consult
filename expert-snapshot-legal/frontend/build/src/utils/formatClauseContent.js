import { load } from 'cheerio';
export function formatClauseContent(html) {
    const $ = load(html);
    const lines = [];
    $('h3, p').each((_, el) => {
        const text = $(el).text().trim();
        if (!text)
            return;
        if ($(el).is('h3')) {
            lines.push({ text, bold: true }); // Treat <h3> as bold title
        }
        else {
            lines.push({ text });
        }
    });
    return lines;
}
