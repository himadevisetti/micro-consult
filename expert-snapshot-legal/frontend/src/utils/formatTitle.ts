import { FormType } from '@/types/FormType';

export function formatRetainerTitle(formType: FormType): string {
  const base = formType.toUpperCase().replace(/-/g, ' ');
  return `${base} AGREEMENT`;
}

export function extractTitleFromHtml(html: string): string | null {
  const match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
  return match ? match[1].trim() : null;
}

