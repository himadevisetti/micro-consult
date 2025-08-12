// utils/textUtils.ts
export function stripTags(html) {
    return html.replace(/<[^>]+>/g, '').trim();
}
