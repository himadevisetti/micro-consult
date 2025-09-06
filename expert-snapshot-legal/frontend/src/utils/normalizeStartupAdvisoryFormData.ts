// src/utils/normalizeStartupAdvisoryFormData.ts

import type {
  StartupAdvisoryFormData,
  AdvisorRole,
  CompensationType,
  PaymentFrequency,
  IPOwnership
} from '../types/StartupAdvisoryFormData';

/**
 * Normalize incoming raw data into canonical form for storage/state.
 * Dates are preserved as ISO strings.
 */
export function normalizeStartupAdvisoryFormData(
  raw: Record<string, any>
): StartupAdvisoryFormData {
  return {
    companyName: String(raw.companyName ?? ''),
    companyAddress: String(raw.companyAddress ?? ''),
    advisorName: String(raw.advisorName ?? ''),
    advisorAddress: String(raw.advisorAddress ?? ''),
    effectiveDate: typeof raw.effectiveDate === 'string' ? raw.effectiveDate : '',
    agreementDuration: String(raw.agreementDuration ?? ''),
    advisorRole: raw.advisorRole as AdvisorRole,

    scopeOfWork: String(raw.scopeOfWork ?? ''),
    timeCommitment: String(raw.timeCommitment ?? ''),

    compensationType: raw.compensationType as CompensationType,
    equityPercentage:
      raw.equityPercentage !== undefined ? Number(raw.equityPercentage) : undefined,
    equityShares:
      raw.equityShares !== undefined ? Number(raw.equityShares) : undefined,
    vestingStartDate:
      typeof raw.vestingStartDate === 'string' ? raw.vestingStartDate : '',
    cliffPeriod: String(raw.cliffPeriod ?? ''),
    totalVestingPeriod: String(raw.totalVestingPeriod ?? ''),
    cashAmount:
      raw.cashAmount !== undefined ? Number(raw.cashAmount) : undefined,
    paymentFrequency: raw.paymentFrequency as PaymentFrequency,
    expenseReimbursement: raw.expenseReimbursement ?? false,
    expenseDetails: String(raw.expenseDetails ?? ''),

    includeConfidentiality: raw.includeConfidentiality ?? true,
    ipOwnership: raw.ipOwnership as IPOwnership,
    nonCompete: raw.nonCompete ?? false,
    nonCompeteDuration: String(raw.nonCompeteDuration ?? ''),

    terminationNoticePeriod: String(raw.terminationNoticePeriod ?? ''),
    includeTerminationForCause: raw.includeTerminationForCause ?? true,

    governingLaw: String(raw.governingLaw ?? 'California'),
    disputeResolution: raw.disputeResolution ?? 'Arbitration',
    includeEntireAgreementClause: raw.includeEntireAgreementClause ?? true,
    additionalProvisions: String(raw.additionalProvisions ?? ''),

    companyRepName: String(raw.companyRepName ?? ''),
    companyRepTitle: String(raw.companyRepTitle ?? ''),
    companySignature: String(raw.companySignature ?? ''),
    advisorSignature: String(raw.advisorSignature ?? ''),
    dateSigned: typeof raw.dateSigned === 'string' ? raw.dateSigned : '',
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

    if (
      field === 'effectiveDate' ||
      field === 'vestingStartDate' ||
      field === 'dateSigned'
    ) {
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

