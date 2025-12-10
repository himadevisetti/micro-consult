// src/utils/buildLitigationEngagementPreviewPayload.ts

import type { LitigationEngagementFormData } from '../types/LitigationEngagementFormData';
import type { LitigationEngagementFieldConfig } from '../types/LitigationEngagementFieldConfig';
import { normalizeValue } from './normalizeValue';

export type LitigationEngagementPreviewPayload = {
  clauses: Array<{ id: string; text: string }>;
  metadata: Record<string, string>;
};

/**
 * Build preview payload for Litigation Engagement forms.
 * - metadata: normalized values for each field
 * - clauses: clause text generated from clauseTemplate substitutions
 */
export function buildLitigationEngagementPreviewPayload(
  formData: LitigationEngagementFormData,
  schema: Record<string, LitigationEngagementFieldConfig>
): LitigationEngagementPreviewPayload {
  const clauses: LitigationEngagementPreviewPayload['clauses'] = [];
  const metadata: LitigationEngagementPreviewPayload['metadata'] = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof LitigationEngagementFormData;
    const rawValue = formData[field];

    metadata[key] = normalizeValue(rawValue);

    if (config.clauseTemplate) {
      const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
        const tokenKey = token.trim() as keyof LitigationEngagementFormData;
        const tokenValue = formData[tokenKey];
        return normalizeValue(tokenValue);
      });

      clauses.push({ id: key, text: clauseText });
    }
  }

  return { clauses, metadata };
}

