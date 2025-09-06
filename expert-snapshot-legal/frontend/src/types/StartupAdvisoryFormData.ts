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
export type PaymentFrequency = 'Monthly' | 'Quarterly' | 'One-time';
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
  timeCommitment: string;     // e.g., "10 hours/month"

  // Compensation & Benefits
  compensationType: CompensationType;
  equityPercentage?: number;  // if Equity or Equity + Cash
  equityShares?: number;      // optional alternative to percentage
  vestingStartDate: string;  // ISO format
  cliffPeriod?: string;       // e.g., "6 months"
  totalVestingPeriod?: string;// e.g., "24 months"
  cashAmount?: number;        // if Cash or Equity + Cash
  paymentFrequency?: PaymentFrequency;
  expenseReimbursement?: boolean;
  expenseDetails?: string;

  // Confidentiality & IP
  includeConfidentiality: boolean;
  ipOwnership: IPOwnership;
  nonCompete?: boolean;
  nonCompeteDuration?: string;

  // Termination
  terminationNoticePeriod: string; // e.g., "30 days"
  includeTerminationForCause: boolean;

  // Miscellaneous
  governingLaw: string;
  disputeResolution: 'Arbitration' | 'Mediation' | 'Court';
  includeEntireAgreementClause: boolean;
  additionalProvisions?: string;

  // Signatures
  companyRepName: string;
  companyRepTitle: string;
  companySignature: string;   // could be base64 or file ref
  advisorSignature: string;   // could be base64 or file ref
  dateSigned: string;         // ISO format
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
  timeCommitment: '',

  compensationType: 'None',
  equityPercentage: undefined,
  equityShares: undefined,
  vestingStartDate: '',
  cliffPeriod: '',
  totalVestingPeriod: '',
  cashAmount: undefined,
  paymentFrequency: undefined,
  expenseReimbursement: false,
  expenseDetails: '',

  includeConfidentiality: true,
  ipOwnership: 'Company',
  nonCompete: false,
  nonCompeteDuration: '',

  terminationNoticePeriod: '',
  includeTerminationForCause: true,

  governingLaw: 'California',
  disputeResolution: 'Arbitration',
  includeEntireAgreementClause: true,
  additionalProvisions: '',

  companyRepName: '',
  companyRepTitle: '',
  companySignature: '',
  advisorSignature: '',
  dateSigned: '',
};

