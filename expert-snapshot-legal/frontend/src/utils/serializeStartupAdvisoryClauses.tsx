// src/utils/serializeStartupAdvisoryClauses.tsx

import * as React from 'react';
import styles from '../styles/StandardPreview.module.css';

import type { StartupAdvisoryFormData } from '../types/StartupAdvisoryFormData';
import { normalizeStartupAdvisoryFormData } from './normalizeStartupAdvisoryFormData';
import { formatDateLong } from './formatDate';
import { getStartupAdvisoryClauses } from '@/components/AgreementClauses/StartupAdvisoryClauses';

export type EnrichedStartupAdvisoryFormData = StartupAdvisoryFormData & {
  formattedEffectiveDateLong: string;
  formattedVestingStartDateLong: string;
  formattedEquityPercentage: string;
  formattedEquityShares: string;
  formattedCashAmount: string;
  formattedInitialPayment: string;
};

export interface StartupAdvisoryClauseTemplate {
  id: string;
  render: (formData: EnrichedStartupAdvisoryFormData) => React.ReactNode;
}

export function getSerializedStartupAdvisoryClauses(
  formData: StartupAdvisoryFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeStartupAdvisoryFormData(formData);

  const formattedEffectiveDateLong = formatDateLong(normalized.effectiveDate);
  const formattedVestingStartDateLong = formatDateLong(normalized.vestingStartDate);

  const formattedEquityPercentage =
    normalized.equityPercentage != null && !Number.isNaN(normalized.equityPercentage)
      ? `${normalized.equityPercentage}%`
      : '';

  const formattedEquityShares =
    normalized.equityShares != null && !Number.isNaN(normalized.equityShares)
      ? normalized.equityShares.toString()
      : '';

  const formattedCashAmount =
    normalized.cashAmount != null && !Number.isNaN(normalized.cashAmount)
      ? normalized.cashAmount.toFixed(2)
      : '';

  const formattedInitialPayment =
    normalized.initialPayment != null && !Number.isNaN(normalized.initialPayment)
      ? normalized.initialPayment.toFixed(2)
      : '';

  const enrichedFormData: EnrichedStartupAdvisoryFormData = {
    ...formData,
    effectiveDate: normalized.effectiveDate,
    vestingStartDate: normalized.vestingStartDate,
    equityPercentage: normalized.equityPercentage,
    equityShares: normalized.equityShares,
    cashAmount: normalized.cashAmount,
    initialPayment: normalized.initialPayment,
    formattedEffectiveDateLong,
    formattedVestingStartDateLong,
    formattedEquityPercentage,
    formattedEquityShares,
    formattedCashAmount,
    formattedInitialPayment,
  };

  const clauseTemplates: StartupAdvisoryClauseTemplate[] =
    getStartupAdvisoryClauses(enrichedFormData);

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
