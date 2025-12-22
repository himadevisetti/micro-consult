// src/utils/serializeFamilyLawAgreementClauses.tsx

import * as React from 'react';
import styles from '../styles/StandardPreview.module.css';

import type { FamilyLawAgreementFormData } from '../types/FamilyLawAgreementFormData';
import { normalizeFamilyLawAgreementFormData } from './normalizeFamilyLawAgreementFormData';
import { formatDateLong } from './formatDate';
import { getFamilyLawAgreementClauses } from '@/components/AgreementClauses/FamilyLawAgreementClauses';

export type EnrichedFamilyLawAgreementFormData = FamilyLawAgreementFormData & {
  formattedExecutionDateLong: string;
  formattedEffectiveDateLong: string;
  formattedExpirationDateLong: string;
  formattedMarriageDateLong: string;
  formattedSeparationDateLong: string;
  formattedMotherIncome: string;
  formattedFatherIncome: string;
  formattedCustodyPercentageMother: string;
  formattedCustodyPercentageFather: string;
  formattedChildSupportAmount: string;
  formattedSpousalSupportAmount: string;
  formattedSpousalSupportDurationMonths: string;
};

export interface FamilyLawAgreementClauseTemplate {
  id: string;
  render: (formData: EnrichedFamilyLawAgreementFormData) => React.ReactNode;
}

export function getSerializedFamilyLawAgreementClauses(
  formData: FamilyLawAgreementFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeFamilyLawAgreementFormData(formData);

  // --- Format dates ---
  const formattedExecutionDateLong = formatDateLong(normalized.executionDate);
  const formattedEffectiveDateLong = formatDateLong(normalized.effectiveDate ?? '');
  const formattedExpirationDateLong = formatDateLong(normalized.expirationDate ?? '');
  const formattedMarriageDateLong = formatDateLong(normalized.marriageDate ?? '');
  const formattedSeparationDateLong = formatDateLong(normalized.separationDate ?? '');

  // --- Format numbers ---
  const formattedMotherIncome =
    normalized.motherIncome != null && !Number.isNaN(normalized.motherIncome)
      ? normalized.motherIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedFatherIncome =
    normalized.fatherIncome != null && !Number.isNaN(normalized.fatherIncome)
      ? normalized.fatherIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedCustodyPercentageMother =
    normalized.custodyPercentageMother != null && !Number.isNaN(normalized.custodyPercentageMother)
      ? `${normalized.custodyPercentageMother}%`
      : '';

  const formattedCustodyPercentageFather =
    normalized.custodyPercentageFather != null && !Number.isNaN(normalized.custodyPercentageFather)
      ? `${normalized.custodyPercentageFather}%`
      : '';

  const formattedChildSupportAmount =
    normalized.childSupportAmount != null && !Number.isNaN(normalized.childSupportAmount)
      ? normalized.childSupportAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedSpousalSupportAmount =
    normalized.spousalSupportAmount != null && !Number.isNaN(normalized.spousalSupportAmount)
      ? normalized.spousalSupportAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedSpousalSupportDurationMonths =
    normalized.spousalSupportDurationMonths != null && !Number.isNaN(normalized.spousalSupportDurationMonths)
      ? `${normalized.spousalSupportDurationMonths} months`
      : '';

  // --- Enriched form data ---
  const enrichedFormData: EnrichedFamilyLawAgreementFormData = {
    ...normalized,
    formattedExecutionDateLong,
    formattedEffectiveDateLong,
    formattedExpirationDateLong,
    formattedMarriageDateLong,
    formattedSeparationDateLong,
    formattedMotherIncome,
    formattedFatherIncome,
    formattedCustodyPercentageMother,
    formattedCustodyPercentageFather,
    formattedChildSupportAmount,
    formattedSpousalSupportAmount,
    formattedSpousalSupportDurationMonths,
  };

  const clauseTemplates: FamilyLawAgreementClauseTemplate[] =
    getFamilyLawAgreementClauses(enrichedFormData);

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
