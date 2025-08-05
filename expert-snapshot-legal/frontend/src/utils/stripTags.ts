export default function stripTags(html: string): string {
  const stripped = html.replace(/<\/?[^>]+(>|$)/g, '');
  const txt = document.createElement('textarea');
  txt.innerHTML = stripped;
  return txt.value.trim();
}
