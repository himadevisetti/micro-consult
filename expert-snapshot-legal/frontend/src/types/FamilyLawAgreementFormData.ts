// src/types/FamilyLawAgreementFormData.ts

/* === Agreement Types === */
export type FamilyLawAgreementType =
  | 'Divorce'
  | 'Custody'
  | 'ChildSupport'
  | 'SpousalSupport'
  | 'PropertySettlement';

/* === Custody & Visitation === */
export type CustodyType = 'Sole' | 'Joint';
export type DecisionMakingAuthority = 'Mother' | 'Father' | 'Joint';
export type VisitationSchedule = 'Standard' | 'Custom' | 'HolidayOnly' | 'None';

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

export type VisitationScheduleEntry = {
  days: DayOfWeek[];
  hours: TimeRange;
};

/* === Support === */
export type SupportPaymentFrequency = 'Weekly' | 'Monthly' | 'Quarterly';
export type ChildSupportPaymentMethod =
  | 'DirectDeposit'
  | 'Check'
  | 'PayrollDeduction'
  | 'Cash'
  | 'Other';

export type ChildSupportResponsibleParty = 'Mother' | 'Father' | 'Joint';
export type SpousalSupportResponsibleParty = 'Spouse1' | 'Spouse2' | 'None';

/* === Property Division === */
export type PropertyDivisionMethod = 'EqualSplit' | 'Negotiated' | 'CourtOrdered';

/* === Dispute Resolution === */
export type DisputeResolution = 'Arbitration' | 'Mediation' | 'Court';

export interface FamilyLawAgreementFormData {
  // Parties (role-specific depending on agreementType)
  petitionerName?: string;
  respondentName?: string;
  petitionerAddress?: string;
  respondentAddress?: string;
  petitionerContact?: string;
  respondentContact?: string;

  motherName?: string;
  fatherName?: string;
  motherAddress?: string;
  fatherAddress?: string;
  motherContact?: string;
  fatherContact?: string;

  spouse1Name?: string;
  spouse2Name?: string;
  spouse1Address?: string;
  spouse2Address?: string;
  spouse1Contact?: string;
  spouse2Contact?: string;

  // Contract metadata
  agreementType: FamilyLawAgreementType;
  executionDate: string; // ISO YYYY-MM-DD
  effectiveDate?: string;
  expirationDate?: string;
  governingLaw: string;

  // Divorce / Separation
  marriageDate?: string;
  separationDate?: string;
  groundsForDivorce?: string;

  // Custody / Visitation
  custodyType?: CustodyType;
  childNames?: string[];
  childDOBs?: string[];
  visitationSchedule?: VisitationSchedule;
  visitationScheduleEntries?: VisitationScheduleEntry[];
  holidaySchedule?: string;
  decisionMakingAuthority?: DecisionMakingAuthority;

  // Child Support
  motherIncome?: number;
  fatherIncome?: number;
  custodyPercentageMother?: number;
  custodyPercentageFather?: number;
  childSupportAmount?: number;
  childSupportPaymentFrequency?: SupportPaymentFrequency;
  childSupportPaymentMethod?: ChildSupportPaymentMethod;
  childSupportResponsibleParty?: ChildSupportResponsibleParty;
  healthInsuranceResponsibility?: ChildSupportResponsibleParty;

  // Spousal Support
  spousalSupportAmount?: number;
  spousalSupportDurationMonths?: number;
  spousalSupportTerminationConditions?: string;
  spousalSupportResponsibleParty?: SpousalSupportResponsibleParty;

  // Property Settlement
  propertyDivisionMethod?: PropertyDivisionMethod;
  assetList?: string[];
  debtAllocation?: string;
  retirementAccounts?: string;
  taxConsiderations?: string;

  // Termination & Remedies
  terminationClause?: string;
  disputeResolution: DisputeResolution;

  // Miscellaneous
  additionalProvisions?: string;

  // Signatures
  petitionerSignatoryName?: string;
  petitionerSignatoryRole?: string;
  respondentSignatoryName?: string;
  respondentSignatoryRole?: string;

  motherSignatoryName?: string;
  motherSignatoryRole?: string;
  fatherSignatoryName?: string;
  fatherSignatoryRole?: string;

  spouse1SignatoryName?: string;
  spouse1SignatoryRole?: string;
  spouse2SignatoryName?: string;
  spouse2SignatoryRole?: string;
}

export const defaultFamilyLawAgreementFormData: FamilyLawAgreementFormData = {
  agreementType: 'Divorce',
  executionDate: '',
  effectiveDate: '',
  expirationDate: '',
  governingLaw: 'California',

  petitionerName: '',
  respondentName: '',
  petitionerAddress: '',
  respondentAddress: '',
  petitionerContact: '',
  respondentContact: '',

  motherName: '',
  fatherName: '',
  motherAddress: '',
  fatherAddress: '',
  motherContact: '',
  fatherContact: '',

  spouse1Name: '',
  spouse2Name: '',
  spouse1Address: '',
  spouse2Address: '',
  spouse1Contact: '',
  spouse2Contact: '',

  marriageDate: '',
  separationDate: '',
  groundsForDivorce: '',

  custodyType: 'Joint',
  childNames: [],
  childDOBs: [],
  visitationSchedule: 'Standard',
  visitationScheduleEntries: [],
  holidaySchedule: '',
  decisionMakingAuthority: 'Joint',

  motherIncome: undefined,
  fatherIncome: undefined,
  custodyPercentageMother: undefined,
  custodyPercentageFather: undefined,
  childSupportAmount: undefined,
  childSupportPaymentFrequency: 'Monthly',
  childSupportPaymentMethod: 'DirectDeposit',
  childSupportResponsibleParty: 'Joint',
  healthInsuranceResponsibility: 'Joint',

  spousalSupportAmount: undefined,
  spousalSupportDurationMonths: undefined,
  spousalSupportTerminationConditions: '',
  spousalSupportResponsibleParty: 'None',

  propertyDivisionMethod: 'EqualSplit',
  assetList: [],
  debtAllocation: '',
  retirementAccounts: '',
  taxConsiderations: '',

  terminationClause: '',
  disputeResolution: 'Arbitration',

  additionalProvisions: '',

  petitionerSignatoryName: '',
  petitionerSignatoryRole: '',
  respondentSignatoryName: '',
  respondentSignatoryRole: '',

  motherSignatoryName: '',
  motherSignatoryRole: '',
  fatherSignatoryName: '',
  fatherSignatoryRole: '',

  spouse1SignatoryName: '',
  spouse1SignatoryRole: '',
  spouse2SignatoryName: '',
  spouse2SignatoryRole: ''
};
