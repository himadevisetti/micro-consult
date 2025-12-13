// src/utils/buildRealEstateContractPreviewPayload.ts

import type { RealEstateContractFormData } from '../types/RealEstateContractFormData';
import type { RealEstateContractFieldConfig } from '../types/RealEstateContractFieldConfig';
import { normalizeValue } from './normalizeValue';

export type RealEstateContractPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

export function buildRealEstateContractPreviewPayload(
  formData: RealEstateContractFormData,
  schema: Record<string, RealEstateContractFieldConfig>
): RealEstateContractPreviewPayload {
  const clauses: RealEstateContractPreviewPayload['clauses'] = [];
  const metadata: RealEstateContractPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof RealEstateContractFormData;
    const rawValue = formData[field];

    // Store normalized value for metadata
    metadata[key] = normalizeValue(rawValue);

    // Build clause text if a template exists
    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof RealEstateContractFormData;
        const tokenValue = formData[tokenKey];
        return normalizeValue(tokenValue);
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}
