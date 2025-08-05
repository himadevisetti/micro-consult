export interface RetainerAgreementIntent {
  clientName: string;
  serviceType: 'legalConsulting' | 'contractReview' | 'complianceAudit';
  startDate: string; // ISO string
  endDate: string; // ISO string
  rate: string; // "$400/hour" or flat "$5000"
  jurisdiction?: string;
  billingCycle?: 'monthly' | 'weekly' | 'perSession';
}

export interface TokenizedContract {
  originalTemplate: string;
  injectedOutput: string;
  fieldsInjected: Record<string, string>;
}
