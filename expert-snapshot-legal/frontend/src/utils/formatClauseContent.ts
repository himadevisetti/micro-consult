// src/utils/formatClauseContent.ts

import { load } from 'cheerio';

export function formatClauseContent(html: string): { text: string; bold?: boolean; spacingAfter?: number }[] {
  const $ = load(html);
  const lines: { text: string; bold?: boolean; spacingAfter?: number }[] = [];

  $('h3, p').each((_, el) => {
    const tag = $(el).get(0)?.tagName;
    const isHeading = tag === 'h3';

    const rawHtml = $(el).html() || '';
    const segments = rawHtml.split(/<br\s*\/?>/i);

    let previousWasUnderline = false;

    segments.forEach((segment) => {
      const segment$ = load(segment);
      const segmentText = segment$('body').text().trim();
      if (!segmentText) return;

      const isUnderline = /^_+$/.test(segmentText.trim());

      if (isUnderline) {
        lines.push({ text: segmentText, spacingAfter: 100 }); // tight spacing below underline
        previousWasUnderline = true;
      } else {
        lines.push({
          text: segmentText,
          bold: isHeading,
          spacingAfter: previousWasUnderline ? 100 : 300, // tighter if follows underline
        });
        previousWasUnderline = false;
      }
    });

    // Add extra spacing after each signatory block
    if (segments.length >= 2) {
      lines.push({ text: "", spacingAfter: 200 });
      lines.push({ text: "", spacingAfter: 200 });
    }
  });

  return lines;
}
