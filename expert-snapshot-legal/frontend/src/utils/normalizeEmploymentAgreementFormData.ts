// src/utils/normalizeEmploymentAgreementFormData.ts

import type {
  EmploymentAgreementFormData,
  ContractType,
  WorkLocation,
  PaymentFrequency,
  BandOrGroup,
  BonusUnit,
  NoticePeriodUnit,
  ProbationPeriodUnit
} from '../types/EmploymentAgreementFormData';

/**
 * Normalize incoming raw data into canonical form for storage/state.
 * Dates are preserved as ISO strings.
 */
export function normalizeEmploymentAgreementFormData(
  raw: Record<string, any>
): EmploymentAgreementFormData {
  const toBool = (val: unknown) => val === true || val === 'true';

  return {
    employerName: String(raw.employerName ?? ''),
    employerAddress: String(raw.employerAddress ?? ''),
    employeeName: String(raw.employeeName ?? ''),
    employeeAddress: String(raw.employeeAddress ?? ''),
    effectiveDate: typeof raw.effectiveDate === 'string' ? raw.effectiveDate : '',
    jobTitle: String(raw.jobTitle ?? ''),
    department: String(raw.department ?? ''),
    reportsTo: String(raw.reportsTo ?? ''),
    bandOrGroup: raw.bandOrGroup as BandOrGroup,
    jurisdiction: String(raw.jurisdiction ?? ''),
    contractType: raw.contractType as ContractType,

    // Salary-based fields
    baseSalary:
      raw.baseSalary !== undefined ? Number(raw.baseSalary) : undefined,
    payFrequency: raw.payFrequency as PaymentFrequency,
    bonusAmount:
      raw.bonusAmount !== undefined && raw.bonusAmount !== ''
        ? Number(raw.bonusAmount)
        : undefined,

    bonusUnit: (raw.bonusUnit as BonusUnit) ?? 'None',
    benefitsList: Array.isArray(raw.benefitsList)
      ? raw.benefitsList.map(String)
      : raw.benefitsList
        ? [String(raw.benefitsList)]
        : undefined,
    annualLeaveDays:
      raw.annualLeaveDays !== undefined ? Number(raw.annualLeaveDays) : undefined,
    sickLeaveDays:
      raw.sickLeaveDays !== undefined ? Number(raw.sickLeaveDays) : undefined,
    probationPeriod:
      raw.probationPeriod !== undefined && raw.probationPeriod !== ''
        ? Number(raw.probationPeriod)
        : undefined,

    probationPeriodUnit:
      (raw.probationPeriodUnit as ProbationPeriodUnit) ?? 'Months',
    noticePeriodEmployer:
      raw.noticePeriodEmployer !== undefined && raw.noticePeriodEmployer !== ''
        ? Number(raw.noticePeriodEmployer)
        : undefined,

    noticePeriodEmployerUnit:
      (raw.noticePeriodEmployerUnit as NoticePeriodUnit) ?? 'Weeks',

    noticePeriodEmployee:
      raw.noticePeriodEmployee !== undefined && raw.noticePeriodEmployee !== ''
        ? Number(raw.noticePeriodEmployee)
        : undefined,

    noticePeriodEmployeeUnit:
      (raw.noticePeriodEmployeeUnit as NoticePeriodUnit) ?? 'Weeks',

    // Hourly-based fields
    hourlyRate:
      raw.hourlyRate !== undefined ? Number(raw.hourlyRate) : undefined,
    hoursPerWeek:
      raw.hoursPerWeek !== undefined ? Number(raw.hoursPerWeek) : undefined,
    contractDurationValue: String(raw.contractDurationValue ?? ''),
    contractDurationUnit: String(raw.contractDurationUnit ?? ''),
    overtimePolicy: String(raw.overtimePolicy ?? ''),

    workLocation: raw.workLocation as WorkLocation,
    workSchedule: String(raw.workSchedule ?? ''),

    // Clause toggles
    nonCompete: toBool(raw.nonCompete),
    nonCompeteDurationValue: String(raw.nonCompeteDurationValue ?? ''),
    nonCompeteDurationUnit: String(raw.nonCompeteDurationUnit ?? ''),
    nonCompeteScope: String(raw.nonCompeteScope ?? ''),
    nonSolicitation: toBool(raw.nonSolicitation),
    includeConfidentiality: toBool(raw.includeConfidentiality),
    includeIPOwnership: toBool(raw.includeIPOwnership),

    // Miscellaneous
    governingLaw: String(raw.governingLaw ?? 'California'),
    disputeResolution: raw.disputeResolution ?? 'Arbitration',
    additionalProvisions: String(raw.additionalProvisions ?? ''),

    // Signatures
    employerSignatoryName: String(raw.employerSignatoryName ?? ''),
    employerSignatoryTitle: String(raw.employerSignatoryTitle ?? '')
  };
}

/**
 * Normalize form data for validation or display.
 * Dates are coerced into `yyyy-mm-dd` format if valid.
 */
export function normalizeRawEmploymentAgreementFormData(
  data: EmploymentAgreementFormData
): EmploymentAgreementFormData {
  const normalized: Partial<EmploymentAgreementFormData> = {};

  for (const key in data) {
    const field = key as keyof EmploymentAgreementFormData;
    const value = data[field];

    if (field === 'effectiveDate') {
      normalized[field] = normalizeDate(value);
    } else {
      assign(normalized, field, value);
    }
  }

  return normalized as EmploymentAgreementFormData;
}

function assign<K extends keyof EmploymentAgreementFormData>(
  target: Partial<EmploymentAgreementFormData>,
  key: K,
  value: EmploymentAgreementFormData[K]
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

