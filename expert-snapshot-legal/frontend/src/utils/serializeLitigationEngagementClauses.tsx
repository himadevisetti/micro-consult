// src/utils/serializeLitigationEngagementClauses.tsx

import * as React from 'react';
import styles from '../styles/StandardPreview.module.css';

import type { LitigationEngagementFormData } from '../types/LitigationEngagementFormData';
import { normalizeLitigationEngagementFormData } from './normalizeLitigationEngagementFormData';
import { formatDateLong } from './formatDate';
import { getLitigationEngagementClauses } from '@/components/AgreementClauses/LitigationEngagementClauses';

export type EnrichedLitigationEngagementFormData = LitigationEngagementFormData & {
  formattedEffectiveDateLong: string;
  formattedExecutionDateLong: string;
  formattedExpirationDateLong: string;
  formattedFeeAmount: string;
  formattedRetainerAmount: string;
};

export interface LitigationEngagementClauseTemplate {
  id: string;
  render: (formData: EnrichedLitigationEngagementFormData) => React.ReactNode;
}

/**
 * Serialize Litigation Engagement clauses into React nodes for preview rendering.
 */
export function getSerializedLitigationEngagementClauses(
  formData: LitigationEngagementFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeLitigationEngagementFormData(formData);

  // ✅ Guard optional dates
  const formattedEffectiveDateLong = formatDateLong(normalized.effectiveDate ?? "");
  const formattedExecutionDateLong = formatDateLong(normalized.executionDate);
  const formattedExpirationDateLong = formatDateLong(normalized.expirationDate ?? "");

  // ✅ Guard numeric fields
  const formattedFeeAmount =
    normalized.feeAmount != null && !Number.isNaN(normalized.feeAmount)
      ? normalized.feeAmount.toFixed(2)
      : "";

  const formattedRetainerAmount =
    normalized.retainerAmount != null && !Number.isNaN(normalized.retainerAmount)
      ? normalized.retainerAmount.toFixed(2)
      : "";

  const enrichedFormData: EnrichedLitigationEngagementFormData = {
    ...formData,
    effectiveDate: normalized.effectiveDate ?? "",
    executionDate: normalized.executionDate,
    expirationDate: normalized.expirationDate ?? "",
    feeAmount: normalized.feeAmount,
    retainerAmount: normalized.retainerAmount ?? 0,
    formattedEffectiveDateLong,
    formattedExecutionDateLong,
    formattedExpirationDateLong,
    formattedFeeAmount,
    formattedRetainerAmount,
  };

  const clauseTemplates: LitigationEngagementClauseTemplate[] =
    getLitigationEngagementClauses(enrichedFormData);

  for (const { id, render } of clauseTemplates) {
    if (!exclude.includes(id)) {
      clauses[id] = (
        <div key={id} className={styles.clauseBlock}>
          {render(enrichedFormData)}
        </div>
      );
    }
  }

  return clauses;
}
