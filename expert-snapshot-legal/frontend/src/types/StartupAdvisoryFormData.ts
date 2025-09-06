// src/types/StartupAdvisoryFormData.ts

// Advisor role/type options
export type AdvisorRole =
  | 'Generic Advisor'
  | 'Financial Advisor'
  | 'Technology Advisor'
  | 'Legal Advisor'
  | 'Marketing Advisor'
  | 'Industry Expert';

// Compensation structure options
export type CompensationType = 'Equity' | 'Cash' | 'Equity + Cash' | 'None';
export type PaymentFrequency = 'Monthly' | 'Quarterly' | 'Annually';
export type InitialPaymentType = 'None' | 'One-time';
export type IPOwnership = 'Company' | 'Advisor' | 'Joint';

export interface StartupAdvisoryFormData {
  // Parties & Dates
  companyName: string;
  companyAddress: string;
  advisorName: string;
  advisorAddress: string;
  effectiveDate: string;      // ISO format: YYYY-MM-DD
  agreementDuration: string;  // e.g., "12 months"
  advisorRole: AdvisorRole;

  // Scope of Services
  scopeOfWork: string;
  timeCommitmentValue: string; // numeric string in raw form
  timeCommitmentUnit: string;  // e.g., "hours/week"

  // Compensation & Benefits
  compensationType: CompensationType;
  equityPercentage?: number;
  equityShares?: number;
  vestingStartDate: string;   // ISO format
  cliffPeriod?: string;
  totalVestingPeriod?: string;
  cashAmount?: number;
  initialPayment?: InitialPaymentType;
  ongoingPaymentFrequency?: PaymentFrequency;
  expenseReimbursement: boolean | 'true' | 'false';
  expenseDetails?: string;

  // Confidentiality & IP
  includeConfidentiality: boolean | 'true' | 'false';
  ipOwnership: IPOwnership;
  includeTerminationForCause: boolean | 'true' | 'false';
  includeEntireAgreementClause: boolean | 'true' | 'false';
  nonCompete: boolean | 'true' | 'false';
  nonCompeteDuration?: string;

  // Miscellaneous
  governingLaw: string;
  disputeResolution: 'Arbitration' | 'Mediation' | 'Court';
  additionalProvisions?: string;

  // Signatures (only name/title kept per schema)
  companyRepName: string;
  companyRepTitle: string;
}

export const defaultStartupAdvisoryFormData: StartupAdvisoryFormData = {
  companyName: '',
  companyAddress: '',
  advisorName: '',
  advisorAddress: '',
  effectiveDate: '',
  agreementDuration: '',
  advisorRole: 'Generic Advisor',

  scopeOfWork: '',
  timeCommitmentValue: '',
  timeCommitmentUnit: '',

  compensationType: 'None',
  equityPercentage: undefined,
  equityShares: undefined,
  vestingStartDate: '',
  cliffPeriod: '',
  totalVestingPeriod: '',
  cashAmount: undefined,
  initialPayment: 'None',
  ongoingPaymentFrequency: undefined,
  expenseReimbursement: 'false',
  expenseDetails: '',

  includeConfidentiality: 'true',
  ipOwnership: 'Company',
  includeTerminationForCause: 'true',
  includeEntireAgreementClause: 'true',
  nonCompete: 'false',
  nonCompeteDuration: '',

  governingLaw: 'California',
  disputeResolution: 'Arbitration',
  additionalProvisions: '',

  companyRepName: '',
  companyRepTitle: ''
};
