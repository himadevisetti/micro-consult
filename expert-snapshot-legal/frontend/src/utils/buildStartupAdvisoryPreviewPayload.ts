// src/utils/buildStartupAdvisoryPreviewPayload.ts

import type { StartupAdvisoryFormData } from '../types/StartupAdvisoryFormData';
import type { StartupAdvisoryFieldConfig } from '../types/StartupAdvisoryFieldConfig';
import { normalizeValue } from './normalizeValue';

export type StartupAdvisoryPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

export function buildStartupAdvisoryPreviewPayload(
  formData: StartupAdvisoryFormData,
  schema: Record<string, StartupAdvisoryFieldConfig>
): StartupAdvisoryPreviewPayload {
  const clauses: StartupAdvisoryPreviewPayload['clauses'] = [];
  const metadata: StartupAdvisoryPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof StartupAdvisoryFormData;
    const rawValue = formData[field];

    // Store normalized value for metadata
    metadata[key] = normalizeValue(rawValue);

    // Build clause text if a template exists
    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof StartupAdvisoryFormData;
        const tokenValue = formData[tokenKey];
        return normalizeValue(tokenValue);
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}

