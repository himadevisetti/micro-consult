// src/config/familyLawAgreementStepperConfig.ts

import { FamilyLawAgreementFormData } from '../types/FamilyLawAgreementFormData';

export type StepConfig = {
  key: string;
  title: string;
  description: string;
  fields: (keyof FamilyLawAgreementFormData)[];
};

export const stepperConfig: Record<string, StepConfig> = {
  Divorce: {
    key: 'Divorce',
    title: 'Divorce Details',
    description: 'Enter marriage, separation, and grounds for divorce.',
    fields: [
      'petitionerName',
      'petitionerAddress',
      'petitionerContact',
      'respondentName',
      'respondentAddress',
      'respondentContact',
      'marriageDate',
      'separationDate',
      'groundsForDivorce',
      'executionDate',
      'effectiveDate',
      'governingLaw',
    ],
  },

  Custody: {
    key: 'Custody',
    title: 'Custody & Visitation',
    description: 'Enter custody type, child details, and visitation schedule.',
    fields: [
      'motherName',
      'motherAddress',
      'motherContact',
      'fatherName',
      'fatherAddress',
      'fatherContact',
      'custodyType',
      'children',
      'visitationSchedule',
      'visitationScheduleEntries',
      'holidaySchedule',
      'decisionMakingAuthority',
    ],
  },

  ChildSupport: {
    key: 'ChildSupport',
    title: 'Child Support',
    description: 'Enter income and support obligations.',
    fields: [
      'motherIncome',
      'fatherIncome',
      'custodyPercentageMother',
      'custodyPercentageFather',
      'childSupportAmount',
      'childSupportPaymentFrequency',
      'childSupportPaymentMethod',
      'childSupportResponsibleParty',
      'healthInsuranceResponsibility',
    ],
  },

  SpousalSupport: {
    key: 'SpousalSupport',
    title: 'Spousal Support',
    description: 'Enter spousal support terms.',
    fields: [
      'spouse1Name',
      'spouse1Address',
      'spouse1Contact',
      'spouse2Name',
      'spouse2Address',
      'spouse2Contact',
      'spousalSupportAmount',
      'spousalSupportDurationMonths',
      'spousalSupportTerminationConditions',
      'spousalSupportResponsibleParty',
    ],
  },

  PropertySettlement: {
    key: 'PropertySettlement',
    title: 'Property Settlement',
    description: 'Enter property division terms.',
    fields: [
      'spouse1Name',
      'spouse1Address',
      'spouse1Contact',
      'spouse2Name',
      'spouse2Address',
      'spouse2Contact',
      'propertyDivisionMethod',
      'assetList',
      'debtAllocation',
      'retirementAccounts',
      'taxConsiderations',
      'expirationDate',
    ],
  },

  // Always‑included clauses (not tied to one module)
  TerminationAndRemedies: {
    key: 'TerminationAndRemedies',
    title: 'Termination & Remedies',
    description: 'Specify termination clauses and dispute resolution method.',
    fields: ['terminationClause', 'disputeResolution'],
  },

  Miscellaneous: {
    key: 'Miscellaneous',
    title: 'Additional Provisions',
    description: 'Enter any additional provisions.',
    fields: ['additionalProvisions'],
  },

  // Signatures step (no hardcoded fields here anymore)
  Signatures: {
    key: 'Signatures',
    title: 'Signatures',
    description: 'Enter signatory names and roles.',
    fields: [], // dynamically injected via getSignatoryFields()
  },

  // Finalization step (no hardcoded signatures)
  Finalization: {
    key: 'Finalization',
    title: 'Finalization & Signatures',
    description: 'Termination clauses, miscellaneous provisions, and signature fields.',
    fields: [
      'terminationClause',
      'disputeResolution',
      'additionalProvisions',
      // signatures injected dynamically via getSignatoryFields()
    ],
  },
};

// Export helper arrays
export const ALWAYS_INCLUDED_KEYS = ['TerminationAndRemedies', 'Miscellaneous', 'Signatures'];

// All selectable agreement types (modules)
export const SELECTABLE_AGREEMENT_TYPES = Object.keys(stepperConfig).filter(
  key => !ALWAYS_INCLUDED_KEYS.includes(key) && key !== 'Finalization'
);
