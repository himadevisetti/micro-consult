import { load } from 'cheerio';
export function formatClauseContent(html) {
    const $ = load(html);
    const lines = [];
    $('h3, p').each((_, el) => {
        const tag = $(el).get(0)?.tagName;
        const isHeading = tag === 'h3';
        const rawHtml = $(el).html() || '';
        const segments = rawHtml.split(/<br\s*\/?>/i);
        segments.forEach((segment) => {
            const segment$ = load(segment);
            const segmentText = segment$('body').text().trim();
            if (!segmentText)
                return;
            lines.push({ text: segmentText, bold: isHeading });
        });
    });
    return lines;
}
