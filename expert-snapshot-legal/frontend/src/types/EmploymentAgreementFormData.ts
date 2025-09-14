// src/types/EmploymentAgreementFormData.ts

export type ContractType =
  | 'Permanent'
  | 'Fixed-Term'
  | 'Probationary'
  | 'Part-Time'
  | 'Temporary'
  | 'Hourly';

export type WorkLocation = 'On-site' | 'Remote' | 'Hybrid';
export type PaymentFrequency = 'Weekly' | 'Biweekly' | 'Monthly';
export type BandOrGroup =
  | 'Band 1 - Entry'
  | 'Band 2 - Mid'
  | 'Band 3 - Senior'
  | 'Executive';

export type BonusUnit = 'None' | 'Quarterly' | 'Annual';
export type NoticePeriodUnit = 'Weeks' | 'Months';
export type ProbationPeriodUnit = 'Weeks' | 'Months';

export interface EmploymentAgreementFormData {
  // Parties & Dates
  employerName: string;
  employerAddress: string;
  employeeName: string;
  employeeAddress: string;
  effectiveDate: string; // ISO format: YYYY-MM-DD
  jobTitle: string;
  department?: string;
  reportsTo?: string;
  bandOrGroup: BandOrGroup;
  jurisdiction: string;
  contractType: ContractType;

  // Dynamic fields based on contractType
  baseSalary?: number; // Permanent/Fixed-Term/Probationary
  payFrequency?: PaymentFrequency;
  bonusAmount?: number;
  bonusUnit?: BonusUnit;
  benefitsList?: string[];
  annualLeaveDays?: number;
  sickLeaveDays?: number;
  probationPeriod?: number;
  probationPeriodUnit?: ProbationPeriodUnit;
  noticePeriodEmployer?: number;
  noticePeriodEmployerUnit?: NoticePeriodUnit;
  noticePeriodEmployee?: number;
  noticePeriodEmployeeUnit?: NoticePeriodUnit;

  hourlyRate?: number; // Temporary/Hourly
  hoursPerWeek?: number;
  contractDurationValue?: string;
  contractDurationUnit?: string;
  overtimePolicy?: string;

  workLocation?: WorkLocation;
  workSchedule?: string;

  // Optional clauses (checkbox toggles)
  nonCompete: boolean;
  nonCompeteDurationValue?: string;
  nonCompeteDurationUnit?: string;
  nonCompeteScope?: string;
  nonSolicitation: boolean;
  includeConfidentiality: boolean;
  includeIPOwnership: boolean;

  // Miscellaneous
  governingLaw: string;
  disputeResolution: 'Arbitration' | 'Mediation' | 'Court';
  additionalProvisions?: string;

  // Signatures
  employerSignatoryName: string;
  employerSignatoryTitle: string;
}

export const defaultEmploymentAgreementFormData: EmploymentAgreementFormData = {
  employerName: '',
  employerAddress: '',
  employeeName: '',
  employeeAddress: '',
  effectiveDate: '',
  jobTitle: '',
  department: '',
  reportsTo: '',
  bandOrGroup: 'Band 1 - Entry',
  jurisdiction: '',
  contractType: 'Permanent',

  baseSalary: undefined,
  payFrequency: 'Monthly',
  bonusAmount: undefined,
  bonusUnit: 'None',
  benefitsList: [],
  annualLeaveDays: undefined,
  sickLeaveDays: undefined,
  probationPeriod: undefined,
  probationPeriodUnit: 'Months',
  noticePeriodEmployer: undefined,
  noticePeriodEmployerUnit: 'Weeks',
  noticePeriodEmployee: undefined,
  noticePeriodEmployeeUnit: 'Weeks',

  hourlyRate: undefined,
  hoursPerWeek: undefined,
  contractDurationValue: '',
  contractDurationUnit: '',
  overtimePolicy: '',

  workLocation: 'On-site',
  workSchedule: '',

  nonCompete: false,
  nonCompeteDurationValue: '',
  nonCompeteDurationUnit: '',
  nonCompeteScope: '',
  nonSolicitation: false,
  includeConfidentiality: true,
  includeIPOwnership: true,

  governingLaw: 'California',
  disputeResolution: 'Arbitration',
  additionalProvisions: '',

  employerSignatoryName: '',
  employerSignatoryTitle: ''
};

