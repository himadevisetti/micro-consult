export default function stripTags(html) {
    const stripped = html.replace(/<\/?[^>]+(>|$)/g, '');
    const txt = document.createElement('textarea');
    txt.innerHTML = stripped;
    return txt.value.trim();
}
