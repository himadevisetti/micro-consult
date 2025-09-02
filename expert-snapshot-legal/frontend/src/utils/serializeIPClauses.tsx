// src/utils/serializeIPClauses.tsx

import * as React from 'react';
import styles from '../styles/StandardPreview.module.css';

import type { IPRightsLicensingFormData } from '../types/IPRightsLicensingFormData';
import { normalizeIPFormData } from './normalizeIPFormData';
import { formatDateLong } from './formatDate';
import { getIPClauses } from '@/components/AgreementClauses/IPClauses';

export type EnrichedIPFormData = IPRightsLicensingFormData & {
  formattedEffectiveDateLong: string;
  formattedExecutionDateLong: string;
  formattedExpirationDateLong: string;
  formattedFeeAmount: string;
  formattedRetainerAmount: string;
};

export interface IPClauseTemplate {
  id: string;
  render: (formData: EnrichedIPFormData) => React.ReactNode;
}

export function getSerializedIPClauses(
  formData: IPRightsLicensingFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeIPFormData(formData);

  const formattedEffectiveDateLong = formatDateLong(normalized.effectiveDate);
  const formattedExecutionDateLong = formatDateLong(normalized.executionDate);
  const formattedExpirationDateLong = formatDateLong(normalized.expirationDate);

  const formattedFeeAmount =
    normalized.feeAmount != null && !Number.isNaN(normalized.feeAmount)
      ? normalized.feeAmount.toFixed(2)
      : '';

  const formattedRetainerAmount =
    normalized.retainerAmount != null && !Number.isNaN(normalized.retainerAmount)
      ? normalized.retainerAmount.toFixed(2)
      : '';

  const enrichedFormData: EnrichedIPFormData = {
    ...formData,
    effectiveDate: normalized.effectiveDate,
    executionDate: normalized.executionDate,
    expirationDate: normalized.expirationDate,
    feeAmount: normalized.feeAmount,
    retainerAmount: normalized.retainerAmount,
    formattedEffectiveDateLong,
    formattedExecutionDateLong,
    formattedExpirationDateLong,
    formattedFeeAmount,
    formattedRetainerAmount,
  };

  const clauseTemplates: IPClauseTemplate[] = getIPClauses(enrichedFormData);

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
