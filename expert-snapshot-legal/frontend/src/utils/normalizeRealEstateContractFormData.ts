// src/utils/normalizeRealEstateContractFormData.ts

import type {
  RealEstateContractFormData,
  PaymentFrequency,
  CommissionUnit,
  DurationUnit,
  RenewalOption
} from '../types/RealEstateContractFormData';
import { normalizeFormDates } from './normalizeFormDates';

/**
 * Normalize incoming raw data into canonical form for storage/state.
 */
export function normalizeRealEstateContractFormData(
  raw: Record<string, any>
): RealEstateContractFormData {
  const toBool = (val: unknown) => val === true || val === 'true';

  const base: RealEstateContractFormData = {
    buyerName: String(raw.buyerName ?? ''),
    sellerName: String(raw.sellerName ?? ''),
    tenantName: String(raw.tenantName ?? ''),
    landlordName: String(raw.landlordName ?? ''),
    brokerName: String(raw.brokerName ?? ''),
    propertyAddress: String(raw.propertyAddress ?? ''),
    legalDescription: String(raw.legalDescription ?? ''),

    contractType: raw.contractType as RealEstateContractFormData['contractType'],
    executionDate: typeof raw.executionDate === 'string' ? raw.executionDate : '',
    closingDate: typeof raw.closingDate === 'string' ? raw.closingDate : '',
    possessionDate: typeof raw.possessionDate === 'string' ? raw.possessionDate : '',
    leaseStartDate: typeof raw.leaseStartDate === 'string' ? raw.leaseStartDate : '',
    leaseEndDate: typeof raw.leaseEndDate === 'string' ? raw.leaseEndDate : '',
    optionExpirationDate: typeof raw.optionExpirationDate === 'string' ? raw.optionExpirationDate : '',
    listingStartDate: typeof raw.listingStartDate === 'string' ? raw.listingStartDate : '',
    listingExpirationDate: typeof raw.listingExpirationDate === 'string' ? raw.listingExpirationDate : '',

    purchasePrice: raw.purchasePrice !== undefined ? Number(raw.purchasePrice) : undefined,
    earnestMoneyDeposit: raw.earnestMoneyDeposit !== undefined ? Number(raw.earnestMoneyDeposit) : undefined,
    financingTerms: String(raw.financingTerms ?? ''),
    rentAmount: raw.rentAmount !== undefined ? Number(raw.rentAmount) : undefined,
    securityDeposit: raw.securityDeposit !== undefined ? Number(raw.securityDeposit) : undefined,
    paymentFrequency: (raw.paymentFrequency as PaymentFrequency) ?? 'Monthly',
    optionFee: raw.optionFee !== undefined ? Number(raw.optionFee) : undefined,
    rentCreditTowardPurchase: raw.rentCreditTowardPurchase !== undefined ? Number(raw.rentCreditTowardPurchase) : undefined,
    commissionValue: raw.commissionValue !== undefined ? Number(raw.commissionValue) : undefined,
    commissionUnit: (raw.commissionUnit as CommissionUnit) ?? 'Percentage',

    inspectionContingency: toBool(raw.inspectionContingency),
    appraisalContingency: toBool(raw.appraisalContingency),
    financingContingency: toBool(raw.financingContingency),
    titleClearance: toBool(raw.titleClearance),
    renewalOptions: (raw.renewalOptions as RenewalOption) ?? 'None',
    disclosureAcknowledgment: toBool(raw.disclosureAcknowledgment),

    escrowAgencyName: String(raw.escrowAgencyName ?? ''),
    closingCostsResponsibility: raw.closingCostsResponsibility ?? 'Buyer',

    terminationClause: String(raw.terminationClause ?? ''),
    defaultRemedies: String(raw.defaultRemedies ?? ''),
    disputeResolution: raw.disputeResolution ?? 'Arbitration',

    governingLaw: String(raw.governingLaw ?? 'California'),
    additionalProvisions: String(raw.additionalProvisions ?? ''),

    partySignatoryName: String(raw.partySignatoryName ?? ''),
    partySignatoryRole: String(raw.partySignatoryRole ?? '')
  };

  return normalizeFormDates(base, [
    'executionDate',
    'closingDate',
    'possessionDate',
    'leaseStartDate',
    'leaseEndDate',
    'optionExpirationDate',
    'listingStartDate',
    'listingExpirationDate',
  ]);
}

/**
 * Normalize already‑typed form data for validation/display.
 */
export function normalizeRawRealEstateContractFormData(
  data: RealEstateContractFormData
): RealEstateContractFormData {
  return normalizeFormDates(data, [
    'executionDate',
    'closingDate',
    'possessionDate',
    'leaseStartDate',
    'leaseEndDate',
    'optionExpirationDate',
    'listingStartDate',
    'listingExpirationDate',
  ]);
}