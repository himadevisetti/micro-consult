// src/schemas/familyLawAgreementSchema.ts

import type { FamilyLawAgreementFormData, VisitationScheduleEntry } from '../types/FamilyLawAgreementFormData';
import { FamilyLawAgreementFieldConfig } from '../types/FamilyLawAgreementFieldConfig';

export const familyLawAgreementSchema: Record<string, FamilyLawAgreementFieldConfig> = {
  // Parties — Divorce
  petitionerName: {
    label: 'Petitioner Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'This Family Law Agreement is made between {{petitionerName}} and {{respondentName}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  petitionerAddress: {
    label: 'Petitioner Address',
    type: 'textarea',
    required: true, // patched: mandatory for Divorce
    placeholder: 'Full address of Petitioner',
    clauseTemplate: 'Petitioner resides at {{petitionerAddress}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  respondentName: {
    label: 'Respondent Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Doe',
    clauseTemplate: 'This Family Law Agreement is made between {{petitionerName}} and {{respondentName}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  respondentAddress: {
    label: 'Respondent Address',
    type: 'textarea',
    required: true, // patched: mandatory for Divorce
    placeholder: 'Full address of Respondent',
    clauseTemplate: 'Respondent resides at {{respondentAddress}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },

  // Parties — Custody / Child Support
  motherName: {
    label: 'Mother Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'This agreement involves {{motherName}} and {{fatherName}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },
  motherAddress: {
    label: 'Mother Address',
    type: 'textarea',
    required: true, // patched: mandatory for Custody/ChildSupport
    placeholder: 'Full address of Mother',
    clauseTemplate: 'Mother resides at {{motherAddress}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },
  fatherName: {
    label: 'Father Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Doe',
    clauseTemplate: 'This agreement involves {{motherName}} and {{fatherName}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },
  fatherAddress: {
    label: 'Father Address',
    type: 'textarea',
    required: true, // patched: mandatory for Custody/ChildSupport
    placeholder: 'Full address of Father',
    clauseTemplate: 'Father resides at {{fatherAddress}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },

  // Parties — Spousal Support / Property Settlement
  spouse1Name: {
    label: 'Spouse 1 Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'This agreement involves {{spouse1Name}} and {{spouse2Name}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  spouse1Address: {
    label: 'Spouse 1 Address',
    type: 'textarea',
    required: true, // patched: mandatory for SpousalSupport/PropertySettlement
    placeholder: 'Full address of Spouse 1',
    clauseTemplate: 'Spouse 1 resides at {{spouse1Address}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  spouse2Name: {
    label: 'Spouse 2 Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Doe',
    clauseTemplate: 'This agreement involves {{spouse1Name}} and {{spouse2Name}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  spouse2Address: {
    label: 'Spouse 2 Address',
    type: 'textarea',
    required: true, // patched: mandatory for SpousalSupport/PropertySettlement
    placeholder: 'Full address of Spouse 2',
    clauseTemplate: 'Spouse 2 resides at {{spouse2Address}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  },

  // Contract metadata
  agreementType: {
    label: 'Agreement Type',
    type: 'dropdown',
    required: true,
    options: ['Divorce', 'Custody', 'ChildSupport', 'SpousalSupport', 'PropertySettlement'],
    placeholder: 'Select agreement type',
    clauseTemplate: 'The parties enter into a {{agreementType}} agreement.',
    group: 'main'
  },
  executionDate: {
    label: 'Execution Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement is executed on {{executionDate}}.',
    group: 'main'
  },
  effectiveDate: {
    label: 'Effective Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement becomes effective on {{effectiveDate}}.',
    group: 'main'
  },
  expirationDate: {
    label: 'Expiration Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement shall expire on {{expirationDate}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  governingLaw: {
    label: 'Governing Law',
    type: 'dropdown',
    required: true,
    options: ['California', 'New York', 'Texas', 'Other'],
    placeholder: 'Select governing law',
    clauseTemplate: 'This agreement is governed by the laws of {{governingLaw}}.',
    default: 'California',
    group: 'main'
  },

  // Divorce / Separation
  marriageDate: {
    label: 'Marriage Date',
    type: 'date',
    required: true, // patched: mandatory for Divorce
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The parties were married on {{marriageDate}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  separationDate: {
    label: 'Separation Date',
    type: 'date',
    required: true, // patched: mandatory for Divorce
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The parties separated on {{separationDate}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  groundsForDivorce: {
    label: 'Grounds for Divorce',
    type: 'textarea',
    required: true, // patched: mandatory for Divorce
    placeholder: 'e.g. Irreconcilable differences',
    clauseTemplate: 'The grounds for divorce are {{groundsForDivorce}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },

  // Custody / Visitation
  custodyType: {
    label: 'Custody Type',
    type: 'dropdown',
    required: true, // patched: mandatory for Custody
    options: ['Sole', 'Joint'],
    placeholder: 'Select custody type',
    clauseTemplate: 'Custody of the children shall be {{custodyType}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Custody',
    group: 'main'
  },
  childNames: {
    label: 'Children Names',
    type: 'textarea',
    required: true, // patched: at least one child name required for Custody
    placeholder: 'List names of children',
    clauseTemplate: 'The children covered by this agreement are: {{childNames}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Custody',
    group: 'main',
    join: (entries: string[]) => entries.join(', ')
  },
  childDOBs: {
    label: 'Children DOBs',
    type: 'textarea',
    required: true, // patched: mandatory for Custody
    placeholder: 'List dates of birth',
    clauseTemplate: 'Dates of birth: {{childDOBs}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Custody',
    group: 'main',
    join: (entries: string[]) => entries.join(', ')
  },
  visitationSchedule: {
    label: 'Visitation Schedule',
    type: 'dropdown',
    required: true, // patched: mandatory for Custody
    options: ['Standard', 'Custom', 'HolidayOnly', 'None'],
    placeholder: 'Select visitation schedule',
    clauseTemplate: 'Visitation schedule: {{visitationSchedule}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Custody',
    group: 'main'
  },
  visitationScheduleEntries: {
    label: 'Visitation Days & Hours',
    type: 'inline-pair',
    required: true, // patched: must have at least one entry when Custom schedule is chosen
    pair: [
      {
        key: 'days',
        label: 'Days',
        type: 'multiselect',
        options: [
          { value: 'Monday', label: 'Monday' },
          { value: 'Tuesday', label: 'Tuesday' },
          { value: 'Wednesday', label: 'Wednesday' },
          { value: 'Thursday', label: 'Thursday' },
          { value: 'Friday', label: 'Friday' },
          { value: 'Saturday', label: 'Saturday' },
          { value: 'Sunday', label: 'Sunday' },
        ],
      },
      {
        key: 'hours',
        label: 'Hours',
        type: 'time-range',
        step: 30,
        startLabel: 'Start time',
        endLabel: 'End time',
      },
    ],
    join: (entries: VisitationScheduleEntry[]) =>
      entries
        .map(({ days, hours }) => `${days.join(', ')}: ${hours.start || ''}–${hours.end || ''}`)
        .filter(Boolean)
        .join('; '),
    clauseTemplate: 'Visitation schedule details: {{visitationScheduleEntries}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' && form.visitationSchedule === 'Custom',
    group: 'main'
  },
  decisionMakingAuthority: {
    label: 'Decision Making Authority',
    type: 'dropdown',
    required: true, // patched: mandatory for Custody
    options: ['Mother', 'Father', 'Joint'],
    placeholder: 'Select authority',
    clauseTemplate: 'Decision-making authority shall rest with {{decisionMakingAuthority}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Custody',
    group: 'main'
  },

  // Child Support
  motherIncome: {
    label: 'Mother Income',
    type: 'number',
    required: true, // patched: mandatory for Child Support
    placeholder: 'e.g. 60000',
    clauseTemplate: 'Mother\'s income is {{motherIncome}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  fatherIncome: {
    label: 'Father Income',
    type: 'number',
    required: true, // patched: mandatory for Child Support
    placeholder: 'e.g. 70000',
    clauseTemplate: 'Father\'s income is {{fatherIncome}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  custodyPercentageMother: {
    label: 'Custody % (Mother)',
    type: 'number',
    required: true, // patched: mandatory for Child Support
    placeholder: 'e.g. 60',
    clauseTemplate: 'Mother has custody {{custodyPercentageMother}}% of the time.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  custodyPercentageFather: {
    label: 'Custody % (Father)',
    type: 'number',
    required: true, // patched: mandatory for Child Support
    placeholder: 'e.g. 40',
    clauseTemplate: 'Father has custody {{custodyPercentageFather}}% of the time.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  childSupportAmount: {
    label: 'Child Support Amount',
    type: 'number',
    required: true, // patched: mandatory for Child Support
    placeholder: 'e.g. 1000',
    clauseTemplate: 'Child support shall be {{childSupportAmount}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  childSupportPaymentFrequency: {
    label: 'Payment Frequency',
    type: 'dropdown',
    required: true, // patched: mandatory for Child Support
    options: ['Weekly', 'Monthly', 'Quarterly'],
    default: 'Monthly',
    clauseTemplate: 'Payments will be made {{childSupportPaymentFrequency}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  childSupportPaymentMethod: {
    label: 'Payment Method',
    type: 'dropdown',
    required: true, // patched: mandatory for Child Support
    options: ['DirectDeposit', 'Check', 'PayrollDeduction', 'Cash', 'Other'],
    default: 'DirectDeposit',
    clauseTemplate: 'Payments will be made via {{childSupportPaymentMethod}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  childSupportResponsibleParty: {
    label: 'Responsible Party',
    type: 'dropdown',
    required: true, // patched: mandatory for Child Support
    options: ['Mother', 'Father', 'Joint'],
    default: 'Joint',
    clauseTemplate: 'Child support responsibility lies with {{childSupportResponsibleParty}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },
  healthInsuranceResponsibility: {
    label: 'Health Insurance Responsibility',
    type: 'dropdown',
    required: true, // patched: mandatory for Child Support
    options: ['Mother', 'Father', 'Joint'],
    default: 'Joint',
    clauseTemplate: 'Health insurance responsibility lies with {{healthInsuranceResponsibility}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'ChildSupport',
    group: 'main'
  },

  // Spousal Support
  spousalSupportAmount: {
    label: 'Spousal Support Amount',
    type: 'number',
    required: true, // patched: mandatory for Spousal Support
    placeholder: 'e.g. 2000',
    clauseTemplate: 'Spousal support shall be {{spousalSupportAmount}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'SpousalSupport',
    group: 'main'
  },
  spousalSupportDurationMonths: {
    label: 'Duration (Months)',
    type: 'number',
    required: true, // patched: mandatory for Spousal Support
    placeholder: 'e.g. 24',
    clauseTemplate: 'Spousal support will continue for {{spousalSupportDurationMonths}} months.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'SpousalSupport',
    group: 'main'
  },
  spousalSupportTerminationConditions: {
    label: 'Termination Conditions',
    type: 'textarea',
    required: false, // optional, can remain flexible
    placeholder: 'e.g. Upon remarriage of recipient',
    clauseTemplate: 'Spousal support terminates under the following conditions: {{spousalSupportTerminationConditions}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'SpousalSupport',
    group: 'main'
  },
  spousalSupportResponsibleParty: {
    label: 'Responsible Party',
    type: 'dropdown',
    required: true, // patched: mandatory for Spousal Support
    options: ['Spouse1', 'Spouse2', 'None'],
    default: 'None',
    clauseTemplate: 'Spousal support responsibility lies with {{spousalSupportResponsibleParty}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'SpousalSupport',
    group: 'main'
  },
  // Property Settlement
  propertyDivisionMethod: {
    label: 'Division Method',
    type: 'dropdown',
    required: true, // patched: mandatory for Property Settlement
    options: ['EqualSplit', 'Negotiated', 'CourtOrdered'],
    default: 'EqualSplit',
    clauseTemplate: 'Property division method: {{propertyDivisionMethod}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  assetList: {
    label: 'Assets',
    type: 'textarea',
    required: true, // patched: at least one asset required
    placeholder: 'Click one or more assets above to select',
    suggestions: ['House', 'Car', 'Bank Account', 'Retirement Fund', 'Investments'],
    clauseTemplate: 'Assets to be divided: {{assetList}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'PropertySettlement',
    group: 'main',
    join: (entries: string[]) => entries.join(', ')
  },
  debtAllocation: {
    label: 'Debt Allocation',
    type: 'textarea',
    required: true, // patched: mandatory for Property Settlement
    placeholder: 'Describe debt allocation',
    clauseTemplate: 'Debts will be allocated as follows: {{debtAllocation}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  retirementAccounts: {
    label: 'Retirement Accounts',
    type: 'textarea',
    required: true, // patched: mandatory for Property Settlement
    placeholder: 'Describe retirement account division',
    clauseTemplate: 'Retirement accounts division: {{retirementAccounts}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  taxConsiderations: {
    label: 'Tax Considerations',
    type: 'textarea',
    required: true, // patched: mandatory for Property Settlement
    placeholder: 'Describe tax considerations',
    clauseTemplate: 'Tax considerations: {{taxConsiderations}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'PropertySettlement',
    group: 'main'
  },

  // Termination & Remedies
  terminationClause: {
    label: 'Termination Clause',
    type: 'textarea',
    required: false, // optional, can remain flexible
    placeholder: 'Describe termination clause',
    clauseTemplate: 'Termination clause: {{terminationClause}}.',
    group: 'main'
  },
  disputeResolution: {
    label: 'Dispute Resolution',
    type: 'dropdown',
    required: true, // already mandatory globally
    options: ['Arbitration', 'Mediation', 'Court'],
    placeholder: 'Select dispute resolution method',
    clauseTemplate: 'Disputes will be resolved via {{disputeResolution}}.',
    group: 'main'
  },
  additionalProvisions: {
    label: 'Additional Terms',
    type: 'textarea',
    required: false, // optional
    placeholder: 'Any additional terms or provisions',
    clauseTemplate: 'Additional provisions: {{additionalProvisions}}.',
    group: 'main'
  },

  // Signatures
  // Divorce
  petitionerSignatoryName: {
    label: 'Petitioner Signatory Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'Signed by {{petitionerSignatoryName}}, Petitioner.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  petitionerSignatoryRole: {
    label: 'Petitioner Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Petitioner',
    clauseTemplate: 'Role: {{petitionerSignatoryRole}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  respondentSignatoryName: {
    label: 'Respondent Signatory Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Doe',
    clauseTemplate: 'Signed by {{respondentSignatoryName}}, Respondent.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },
  respondentSignatoryRole: {
    label: 'Respondent Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Respondent',
    clauseTemplate: 'Role: {{respondentSignatoryRole}}.',
    showIf: (form: FamilyLawAgreementFormData) => form.agreementType === 'Divorce',
    group: 'main'
  },

  // Custody / Child Support
  motherSignatoryName: {
    label: 'Mother Signatory Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'Signed by {{motherSignatoryName}}, Mother.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },
  motherSignatoryRole: {
    label: 'Mother Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Mother',
    clauseTemplate: 'Role: {{motherSignatoryRole}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },
  fatherSignatoryName: {
    label: 'Father Signatory Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Doe',
    clauseTemplate: 'Signed by {{fatherSignatoryName}}, Father.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },
  fatherSignatoryRole: {
    label: 'Father Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Father',
    clauseTemplate: 'Role: {{fatherSignatoryRole}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'Custody' || form.agreementType === 'ChildSupport',
    group: 'main'
  },

  // Spousal Support / Property Settlement
  spouse1SignatoryName: {
    label: 'Spouse 1 Signatory Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'Signed by {{spouse1SignatoryName}}, Spouse 1.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  spouse1SignatoryRole: {
    label: 'Spouse 1 Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Wife',
    clauseTemplate: 'Role: {{spouse1SignatoryRole}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  spouse2SignatoryName: {
    label: 'Spouse 2 Signatory Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Doe',
    clauseTemplate: 'Signed by {{spouse2SignatoryName}}, Spouse 2.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  },
  spouse2SignatoryRole: {
    label: 'Spouse 2 Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Husband',
    clauseTemplate: 'Role: {{spouse2SignatoryRole}}.',
    showIf: (form: FamilyLawAgreementFormData) =>
      form.agreementType === 'SpousalSupport' || form.agreementType === 'PropertySettlement',
    group: 'main'
  }
};
