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
  agreementDurationValue: string; // numeric string in raw form
  agreementDurationUnit: string;  // e.g., "months"
  advisorRole: AdvisorRole;

  // Scope of Services
  scopeOfWork: string;
  timeCommitmentValue: string; // numeric string in raw form
  timeCommitmentUnit: string;  // e.g., "hours/week"

  // Compensation & Benefits
  compensationType: CompensationType;

  // NEW: split grant toggle + fields
  splitEquityGrant?: boolean;
  initialEquityPercentage?: number;
  initialEquityShares?: number;
  futureEquityPercentage?: number;
  futureEquityShares?: number;

  // Existing equity fields (used when splitEquityGrant is false/unchecked)
  equityPercentage?: number;
  equityShares?: number;

  vestingStartDate: string;   // ISO format
  cliffPeriod?: string;
  totalVestingPeriod?: string;
  cashAmount?: number;
  initialPayment?: InitialPaymentType;
  ongoingPaymentFrequency?: PaymentFrequency; // label changed to "Payout Frequency" in schema
  expenseReimbursement: boolean;
  expenseDetails?: string;

  // Confidentiality & IP
  includeConfidentiality: boolean;
  ipOwnership: IPOwnership;
  includeTerminationForCause: boolean;
  includeEntireAgreementClause: boolean;
  nonCompete: boolean;
  nonCompeteDuration?: string;

  // Miscellaneous
  governingLaw: string;
  disputeResolution: 'Arbitration' | 'Mediation' | 'Court';
  additionalProvisions?: string;

  // Signatures
  companyRepName: string;
  companyRepTitle: string;
}

export const defaultStartupAdvisoryFormData: StartupAdvisoryFormData = {
  companyName: '',
  companyAddress: '',
  advisorName: '',
  advisorAddress: '',
  effectiveDate: '',
  agreementDurationValue: '',
  agreementDurationUnit: '',
  advisorRole: 'Generic Advisor',

  scopeOfWork: '',
  timeCommitmentValue: '',
  timeCommitmentUnit: '',

  compensationType: 'None',

  // NEW: defaults for split grant fields
  splitEquityGrant: false,
  initialEquityPercentage: undefined,
  initialEquityShares: undefined,
  futureEquityPercentage: undefined,
  futureEquityShares: undefined,

  equityPercentage: undefined,
  equityShares: undefined,

  vestingStartDate: '',
  cliffPeriod: '',
  totalVestingPeriod: '',
  cashAmount: undefined,
  initialPayment: 'None',
  ongoingPaymentFrequency: undefined,
  expenseReimbursement: false,
  expenseDetails: '',

  includeConfidentiality: true,
  ipOwnership: 'Company',
  includeTerminationForCause: true,
  includeEntireAgreementClause: true,
  nonCompete: false,
  nonCompeteDuration: '',

  governingLaw: 'California',
  disputeResolution: 'Arbitration',
  additionalProvisions: '',

  companyRepName: '',
  companyRepTitle: ''
};

