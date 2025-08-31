// src/utils/buildRetainerPreviewPayload.ts

import type { RetainerFormData } from '../types/RetainerFormData';
import type { RetainerFieldConfig } from '../types/RetainerFieldConfig';
import { normalizeValue } from './normalizeValue';

export type RetainerPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

export function buildRetainerPreviewPayload(
  formData: RetainerFormData,
  schema: Record<string, RetainerFieldConfig>
): RetainerPreviewPayload {
  const clauses: RetainerPreviewPayload['clauses'] = [];
  const metadata: RetainerPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof RetainerFormData;
    const rawValue = formData[field];

    metadata[key] = normalizeValue(rawValue);

    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof RetainerFormData;
        const tokenValue = formData[tokenKey];
        return normalizeValue(tokenValue);
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}
