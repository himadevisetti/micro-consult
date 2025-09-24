// src/types/EmploymentAgreementFormData.ts

export type ContractType =
  | 'Permanent'
  | 'Fixed-Term'
  | 'Probationary'
  | 'Part-Time'
  | 'Temporary'
  | 'Hourly';

export type WorkLocation = 'On-site' | 'Remote' | 'Hybrid';
export type BandOrGroup =
  | 'Not Applicable'
  | 'Band 1 - Entry'
  | 'Band 2 - Mid'
  | 'Band 3 - Senior'
  | 'Executive';

export type PaymentFrequency = 'Weekly' | 'Biweekly' | 'Monthly';
export type BonusUnit = 'None' | 'Quarterly' | 'Annually';
export type ProbationPeriodUnit = 'Months';
export type NoticePeriodUnit = 'Weeks' | 'Months';
export type DurationUnit = 'Days' | 'Weeks' | 'Months' | 'Years';

/* === Work Schedule types === */
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type TimeRange = {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
};

export type WorkScheduleEntry = {
  days: DayOfWeek[];
  hours: TimeRange;
};

export type CompensationType = 'Salary' | 'Hourly';

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
  compensationType?: CompensationType;

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
  contractDurationValue?: number;
  contractDurationUnit?: DurationUnit;
  overtimePolicy?: string;

  workLocation?: WorkLocation;

  // Updated: array of structured schedule entries
  workSchedule?: WorkScheduleEntry[];

  // Optional clauses (checkbox toggles)
  nonCompete: boolean;
  nonCompeteDurationValue?: number;
  nonCompeteDurationUnit?: DurationUnit;
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
  bandOrGroup: 'Not Applicable',
  jurisdiction: '',
  contractType: 'Permanent',
  compensationType: 'Salary',

  baseSalary: undefined,
  payFrequency: 'Biweekly',
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
  contractDurationValue: undefined,
  contractDurationUnit: 'Months',
  overtimePolicy: '',

  workLocation: 'On-site',

  // Updated: empty array instead of empty string
  workSchedule: [],

  nonCompete: false,
  nonCompeteDurationValue: undefined,
  nonCompeteDurationUnit: 'Months',
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
