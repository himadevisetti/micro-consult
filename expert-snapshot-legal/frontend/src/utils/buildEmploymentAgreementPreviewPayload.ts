// src/utils/buildEmploymentAgreementPreviewPayload.ts

import type { EmploymentAgreementFormData } from '../types/EmploymentAgreementFormData';
import type { EmploymentAgreementFieldConfig } from '../types/EmploymentAgreementFieldConfig';
import { normalizeValue } from './normalizeValue';

export type EmploymentAgreementPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

export function buildEmploymentAgreementPreviewPayload(
  formData: EmploymentAgreementFormData,
  schema: Record<string, EmploymentAgreementFieldConfig>
): EmploymentAgreementPreviewPayload {
  const clauses: EmploymentAgreementPreviewPayload['clauses'] = [];
  const metadata: EmploymentAgreementPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof EmploymentAgreementFormData;
    const rawValue = formData[field];

    // Store normalized value for metadata
    metadata[key] = normalizeValue(rawValue);

    // Build clause text if a template exists
    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof EmploymentAgreementFormData;
        const tokenValue = formData[tokenKey];
        return normalizeValue(tokenValue);
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}

