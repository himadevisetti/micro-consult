// src/utils/buildFamilyLawAgreementPreviewPayload.ts

import type { FamilyLawAgreementFormData } from '../types/FamilyLawAgreementFormData';
import type { FamilyLawAgreementFieldConfig } from '../types/FamilyLawAgreementFieldConfig';
import { normalizeValue } from './normalizeValue';

export type FamilyLawAgreementPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

export function buildFamilyLawAgreementPreviewPayload(
  formData: FamilyLawAgreementFormData,
  schema: Record<string, FamilyLawAgreementFieldConfig>
): FamilyLawAgreementPreviewPayload {
  const clauses: FamilyLawAgreementPreviewPayload['clauses'] = [];
  const metadata: FamilyLawAgreementPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof FamilyLawAgreementFormData;
    const rawValue = formData[field];

    // Store normalized value for metadata
    metadata[key] = normalizeValue(rawValue);

    // Build clause text if a template exists
    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof FamilyLawAgreementFormData;
        const tokenValue = formData[tokenKey];
        return normalizeValue(tokenValue);
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}

