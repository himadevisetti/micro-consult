// src/utils/serializeEmploymentAgreementClauses.tsx

import * as React from 'react';
import styles from '../styles/StandardPreview.module.css';

import type { EmploymentAgreementFormData } from '../types/EmploymentAgreementFormData';
import { normalizeEmploymentAgreementFormData } from './normalizeEmploymentAgreementFormData';
import { formatDateLong } from './formatDate';
import { getEmploymentAgreementClauses } from '@/components/AgreementClauses/EmploymentAgreementClauses';

export type EnrichedEmploymentAgreementFormData = EmploymentAgreementFormData & {
  formattedEffectiveDateLong: string;
  formattedBaseSalary: string;
  formattedHourlyRate: string;
  formattedAnnualLeaveDays: string;
  formattedSickLeaveDays: string;
  formattedBonusAmount: string;
  formattedProbationPeriod: string;
  formattedNoticePeriodEmployer: string;
  formattedNoticePeriodEmployee: string;
  formattedHoursPerWeek: string;
  formattedContractDuration: string;
  formattedNonCompeteDuration: string;
};

export interface EmploymentAgreementClauseTemplate {
  id: string;
  render: (formData: EnrichedEmploymentAgreementFormData) => React.ReactNode;
}

export function getSerializedEmploymentAgreementClauses(
  formData: EmploymentAgreementFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeEmploymentAgreementFormData(formData);

  const formattedEffectiveDateLong = formatDateLong(normalized.effectiveDate);

  const formattedBaseSalary =
    normalized.baseSalary != null && !Number.isNaN(normalized.baseSalary)
      ? normalized.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedHourlyRate =
    normalized.hourlyRate != null && !Number.isNaN(normalized.hourlyRate)
      ? normalized.hourlyRate.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedAnnualLeaveDays =
    normalized.annualLeaveDays != null && !Number.isNaN(normalized.annualLeaveDays)
      ? normalized.annualLeaveDays.toString()
      : '';

  const formattedSickLeaveDays =
    normalized.sickLeaveDays != null && !Number.isNaN(normalized.sickLeaveDays)
      ? normalized.sickLeaveDays.toString()
      : '';

  const formattedBonusAmount =
    normalized.bonusAmount != null && !Number.isNaN(normalized.bonusAmount)
      ? normalized.bonusAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedProbationPeriod =
    normalized.probationPeriod != null && !Number.isNaN(normalized.probationPeriod)
      ? normalized.probationPeriod.toString()
      : '';

  const formattedNoticePeriodEmployer =
    normalized.noticePeriodEmployer != null && !Number.isNaN(normalized.noticePeriodEmployer)
      ? normalized.noticePeriodEmployer.toString()
      : '';

  const formattedNoticePeriodEmployee =
    normalized.noticePeriodEmployee != null && !Number.isNaN(normalized.noticePeriodEmployee)
      ? normalized.noticePeriodEmployee.toString()
      : '';

  const formattedHoursPerWeek =
    normalized.hoursPerWeek != null && !Number.isNaN(normalized.hoursPerWeek)
      ? normalized.hoursPerWeek.toString()
      : '';

  const formattedContractDuration =
    normalized.contractDurationValue && normalized.contractDurationUnit
      ? `${normalized.contractDurationValue} ${normalized.contractDurationUnit}`
      : '';

  const formattedNonCompeteDuration =
    normalized.nonCompeteDurationValue && normalized.nonCompeteDurationUnit
      ? `${normalized.nonCompeteDurationValue} ${normalized.nonCompeteDurationUnit}`
      : '';

  const enrichedFormData: EnrichedEmploymentAgreementFormData = {
    ...normalized,
    formattedEffectiveDateLong,
    formattedBaseSalary,
    formattedHourlyRate,
    formattedAnnualLeaveDays,
    formattedSickLeaveDays,
    formattedBonusAmount,
    formattedProbationPeriod,
    formattedNoticePeriodEmployer,
    formattedNoticePeriodEmployee,
    formattedHoursPerWeek,
    formattedContractDuration,
    formattedNonCompeteDuration,
  };

  const clauseTemplates: EmploymentAgreementClauseTemplate[] =
    getEmploymentAgreementClauses(enrichedFormData);

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
