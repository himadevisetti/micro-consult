// src/utils/buildRetainerPreviewPayload.ts

import { standardRetainerSchema } from '../schemas/standardRetainerSchema';
import type { RetainerFormData } from '../types/RetainerFormData';
import { formatDateLong } from './formatDate';

export type RetainerPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

export function buildRetainerPreviewPayload(formData: RetainerFormData): RetainerPreviewPayload {
  const clauses: RetainerPreviewPayload['clauses'] = [];
  const metadata: RetainerPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(standardRetainerSchema)) {
    const field = key as keyof RetainerFormData;
    const rawValue = formData[field];

    // Normalize value to string for metadata
    const value =
      rawValue instanceof Date
        ? formatDateLong(rawValue)
        : typeof rawValue === 'number'
          ? rawValue.toString()
          : rawValue ?? '';

    metadata[key] = value;

    // Clause interpolation
    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof RetainerFormData;
        const tokenValue = formData[tokenKey];

        return tokenValue instanceof Date
          ? formatDateLong(tokenValue)
          : typeof tokenValue === 'number'
            ? tokenValue.toString()
            : tokenValue ?? '';
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}
