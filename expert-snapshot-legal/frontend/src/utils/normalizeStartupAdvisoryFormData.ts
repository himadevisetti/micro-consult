// src/utils/normalizeStartupAdvisoryFormData.ts

import type {
  StartupAdvisoryFormData,
  AdvisorRole,
  CompensationType,
  PaymentFrequency,
  IPOwnership,
  InitialPaymentType
} from '../types/StartupAdvisoryFormData';

/**
 * Normalize incoming raw data into canonical form for storage/state.
 * Dates are preserved as ISO strings.
 */
export function normalizeStartupAdvisoryFormData(
  raw: Record<string, any>
): StartupAdvisoryFormData {
  const toBool = (val: unknown) => val === true || val === 'true';

  const splitGrant = toBool(raw.splitEquityGrant);

  return {
    companyName: String(raw.companyName ?? ''),
    companyAddress: String(raw.companyAddress ?? ''),
    advisorName: String(raw.advisorName ?? ''),
    advisorAddress: String(raw.advisorAddress ?? ''),
    effectiveDate: typeof raw.effectiveDate === 'string' ? raw.effectiveDate : '',
    agreementDurationValue: String(raw.agreementDurationValue ?? ''),
    agreementDurationUnit: String(raw.agreementDurationUnit ?? ''),
    advisorRole: raw.advisorRole as AdvisorRole,

    scopeOfWork: String(raw.scopeOfWork ?? ''),
    timeCommitmentValue: String(raw.timeCommitmentValue ?? ''),
    timeCommitmentUnit: String(raw.timeCommitmentUnit ?? ''),

    compensationType: raw.compensationType as CompensationType,

    // Split grant toggle + fields
    splitEquityGrant: toBool(raw.splitEquityGrant),
    initialEquityPercentage: splitGrant && raw.initialEquityPercentage !== undefined
      ? Number(raw.initialEquityPercentage)
      : undefined,
    initialEquityShares: splitGrant && raw.initialEquityShares !== undefined
      ? Number(raw.initialEquityShares)
      : undefined,
    futureEquityPercentage: splitGrant && raw.futureEquityPercentage !== undefined
      ? Number(raw.futureEquityPercentage)
      : undefined,
    futureEquityShares: splitGrant && raw.futureEquityShares !== undefined
      ? Number(raw.futureEquityShares)
      : undefined,

    // Existing equity fields (only when splitEquityGrant is false)
    equityPercentage: !splitGrant && raw.equityPercentage !== undefined
      ? Number(raw.equityPercentage)
      : undefined,
    equityShares: !splitGrant && raw.equityShares !== undefined
      ? Number(raw.equityShares)
      : undefined,

    vestingStartDate:
      typeof raw.vestingStartDate === 'string' ? raw.vestingStartDate : '',
    cliffPeriod: String(raw.cliffPeriod ?? ''),
    totalVestingPeriod: String(raw.totalVestingPeriod ?? ''),
    cashAmount:
      raw.cashAmount !== undefined ? Number(raw.cashAmount) : undefined,
    initialPayment: raw.initialPayment as InitialPaymentType,
    ongoingPaymentFrequency: raw.ongoingPaymentFrequency as PaymentFrequency,

    // ✅ All checkbox fields coerced to boolean
    expenseReimbursement: toBool(raw.expenseReimbursement),
    expenseDetails: String(raw.expenseDetails ?? ''),

    includeConfidentiality: toBool(raw.includeConfidentiality),
    ipOwnership: raw.ipOwnership as IPOwnership,
    includeTerminationForCause: toBool(raw.includeTerminationForCause),
    includeEntireAgreementClause: toBool(raw.includeEntireAgreementClause),
    nonCompete: toBool(raw.nonCompete),
    nonCompeteDuration: String(raw.nonCompeteDuration ?? ''),

    governingLaw: String(raw.governingLaw ?? 'California'),
    disputeResolution: raw.disputeResolution ?? 'Arbitration',
    additionalProvisions: String(raw.additionalProvisions ?? ''),

    companyRepName: String(raw.companyRepName ?? ''),
    companyRepTitle: String(raw.companyRepTitle ?? '')
  };
}

/**
 * Normalize form data for validation or display.
 * Dates are coerced into `yyyy-mm-dd` format if valid.
 */
export function normalizeRawStartupAdvisoryFormData(
  data: StartupAdvisoryFormData
): StartupAdvisoryFormData {
  const normalized: Partial<StartupAdvisoryFormData> = {};

  for (const key in data) {
    const field = key as keyof StartupAdvisoryFormData;
    const value = data[field];

    if (field === 'effectiveDate' || field === 'vestingStartDate') {
      normalized[field] = normalizeDate(value);
    } else {
      assign(normalized, field, value);
    }
  }

  return normalized as StartupAdvisoryFormData;
}

function assign<K extends keyof StartupAdvisoryFormData>(
  target: Partial<StartupAdvisoryFormData>,
  key: K,
  value: StartupAdvisoryFormData[K]
) {
  target[key] = value;
}

/**
 * Coerces a date string into ISO format (`yyyy-mm-dd`) if valid.
 * Accepts either ISO or `MM/DD/YYYY` format.
 */
function normalizeDate(input: unknown): string {
  if (typeof input !== 'string') return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}
