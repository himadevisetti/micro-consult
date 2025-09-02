import type { IPRightsLicensingFormData } from '../types/IPRightsLicensingFormData';
import type { IPRetainerFieldConfig } from '../types/IPRetainerFieldConfig';
import { normalizeValue } from './normalizeValue';

export type IPPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

export function buildIPPreviewPayload(
  formData: IPRightsLicensingFormData,
  schema: Record<string, IPRetainerFieldConfig>
): IPPreviewPayload {
  const clauses: IPPreviewPayload['clauses'] = [];
  const metadata: IPPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof IPRightsLicensingFormData;
    const rawValue = formData[field];

    metadata[key] = normalizeValue(rawValue);

    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof IPRightsLicensingFormData;
        const tokenValue = formData[tokenKey];
        return normalizeValue(tokenValue);
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}

