// src/utils/serializeClauses.tsx

import * as React from 'react';
import styles from '../styles/StandardPreview.module.css';

import type { RetainerFormData } from '../types/RetainerFormData';
import { normalizeFormData } from './normalizeFormData';
import { formatDateLong } from './formatDate';
import { getClauses } from '@/components/AgreementClauses/clauses';

export type EnrichedFormData = RetainerFormData & {
  formattedStartDateLong: string;
  formattedEndDateLong: string;
  formattedFeeAmount: string;
  formattedRetainerAmount: string;
};

export interface ClauseTemplate {
  id: string;
  render: (formData: EnrichedFormData) => React.ReactNode;
}

export function getSerializedClauses(
  formData: RetainerFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeFormData(formData);

  const formattedStartDateLong = formatDateLong(normalized.startDate);
  const formattedEndDateLong = formatDateLong(normalized.endDate);

  const formattedFeeAmount =
    normalized.feeAmount != null && !Number.isNaN(normalized.feeAmount)
      ? normalized.feeAmount.toFixed(2)
      : '';

  const formattedRetainerAmount =
    normalized.retainerAmount != null && !Number.isNaN(normalized.retainerAmount)
      ? normalized.retainerAmount.toFixed(2)
      : '';

  const enrichedFormData: EnrichedFormData = {
    ...formData,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    feeAmount: normalized.feeAmount,
    retainerAmount: normalized.retainerAmount,
    formattedStartDateLong,
    formattedEndDateLong,
    formattedFeeAmount,
    formattedRetainerAmount,
  };

  const clauseTemplates: ClauseTemplate[] = getClauses(enrichedFormData);

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
