// src/utils/serializeRealEstateContractClauses.tsx

import * as React from 'react';
import styles from '../styles/StandardPreview.module.css';

import type { RealEstateContractFormData } from '../types/RealEstateContractFormData';
import { normalizeRealEstateContractFormData } from './normalizeRealEstateContractFormData';
import { formatDateLong } from './formatDate';
import { getRealEstateContractClauses } from '@/components/AgreementClauses/RealEstateContractClauses';

export type EnrichedRealEstateContractFormData = RealEstateContractFormData & {
  formattedExecutionDateLong: string;
  formattedClosingDateLong: string;
  formattedPossessionDateLong: string;
  formattedLeaseStartDateLong: string;
  formattedLeaseEndDateLong: string;
  formattedOptionExpirationDateLong: string;
  formattedListingStartDateLong: string;
  formattedListingExpirationDateLong: string;

  formattedPurchasePrice: string;
  formattedEarnestMoneyDeposit: string;
  formattedRentAmount: string;
  formattedSecurityDeposit: string;
  formattedOptionFee: string;
  formattedRentCreditTowardPurchase: string;
  formattedCommissionValue: string;
  formattedLeaseDuration: string;
};

export interface RealEstateContractClauseTemplate {
  id: string;
  render: (formData: EnrichedRealEstateContractFormData) => React.ReactNode;
}

export function getSerializedRealEstateContractClauses(
  formData: RealEstateContractFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeRealEstateContractFormData(formData);

  // --- Format dates ---
  const formattedExecutionDateLong = formatDateLong(normalized.executionDate);
  const formattedClosingDateLong = formatDateLong(normalized.closingDate ?? '');
  const formattedPossessionDateLong = formatDateLong(normalized.possessionDate ?? '');
  const formattedLeaseStartDateLong = formatDateLong(normalized.leaseStartDate ?? '');
  const formattedLeaseEndDateLong = formatDateLong(normalized.leaseEndDate ?? '');
  const formattedOptionExpirationDateLong = formatDateLong(normalized.optionExpirationDate ?? '');
  const formattedListingStartDateLong = formatDateLong(normalized.listingStartDate ?? '');
  const formattedListingExpirationDateLong = formatDateLong(normalized.listingExpirationDate ?? '');

  // --- Format numeric values ---
  const formattedPurchasePrice =
    normalized.purchasePrice != null && !Number.isNaN(normalized.purchasePrice)
      ? normalized.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedEarnestMoneyDeposit =
    normalized.earnestMoneyDeposit != null && !Number.isNaN(normalized.earnestMoneyDeposit)
      ? normalized.earnestMoneyDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedRentAmount =
    normalized.rentAmount != null && !Number.isNaN(normalized.rentAmount)
      ? normalized.rentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedSecurityDeposit =
    normalized.securityDeposit != null && !Number.isNaN(normalized.securityDeposit)
      ? normalized.securityDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedOptionFee =
    normalized.optionFee != null && !Number.isNaN(normalized.optionFee)
      ? normalized.optionFee.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedRentCreditTowardPurchase =
    normalized.rentCreditTowardPurchase != null && !Number.isNaN(normalized.rentCreditTowardPurchase)
      ? normalized.rentCreditTowardPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  const formattedCommissionValue =
    normalized.commissionValue != null && !Number.isNaN(normalized.commissionValue)
      ? normalized.commissionValue.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '';

  let formattedLeaseDuration = '';
  if (normalized.leaseStartDate && normalized.leaseEndDate) {
    formattedLeaseDuration = `${formatDateLong(normalized.leaseStartDate)} → ${formatDateLong(normalized.leaseEndDate)}`;
  }

  const enrichedFormData: EnrichedRealEstateContractFormData = {
    ...normalized,
    formattedExecutionDateLong,
    formattedClosingDateLong,
    formattedPossessionDateLong,
    formattedLeaseStartDateLong,
    formattedLeaseEndDateLong,
    formattedOptionExpirationDateLong,
    formattedListingStartDateLong,
    formattedListingExpirationDateLong,
    formattedPurchasePrice,
    formattedEarnestMoneyDeposit,
    formattedRentAmount,
    formattedSecurityDeposit,
    formattedOptionFee,
    formattedRentCreditTowardPurchase,
    formattedCommissionValue,
    formattedLeaseDuration,
  };

  const clauseTemplates: RealEstateContractClauseTemplate[] =
    getRealEstateContractClauses(enrichedFormData);

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
