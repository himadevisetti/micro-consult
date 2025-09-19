import type { FormType } from '../types/FormType';

export function formatRetainerTitle(formType: FormType): string {
  const labelMap: Record<FormType, string> = {
    'standard-retainer': 'Standard Retainer',
    'ip-rights-licensing': 'IP Rights & Licensing',
    'startup-advisory': 'Startup Advisory',
    'employment-agreement': 'Employment Agreement',
    'litigation-engagement': 'Litigation Engagement',
    'real-estate-contract': 'Real Estate Contract',
    'family-law-agreement': 'Family Law Agreement',
    'custom-template': 'Custom Template',
  };

  const label = labelMap[formType] || formType;

  if (/\b(Agreement|Engagement|Contract)\b$/i.test(label)) {
    return label.toUpperCase();
  }
  return `${label.toUpperCase()} AGREEMENT`;
}

export function extractTitleFromHtml(html: string): string | null {
  const match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
  return match ? match[1].trim() : null;
}

