import { FormType, getFormTypeLabel } from '../types/FormType.js';

export function formatRetainerTitle(formType: FormType): string {
  const label = getFormTypeLabel(formType);

  if (/\b(Agreement|Engagement|Contract)\b$/i.test(label)) {
    return label.toUpperCase();
  }
  return `${label.toUpperCase()} AGREEMENT`;
}

export function extractTitleFromHtml(html: string): string | null {
  const match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
  return match ? match[1].trim() : null;
}
