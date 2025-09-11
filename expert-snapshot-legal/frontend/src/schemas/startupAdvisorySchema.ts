// src/types/startupAdvisorySchema.ts

import type { StartupAdvisoryFormData } from '../types/StartupAdvisoryFormData';
import { StartupAdvisoryFieldConfig } from '../types/StartupAdvisoryFieldConfig';

export const startupAdvisorySchema: Record<string, StartupAdvisoryFieldConfig> = {
  companyName: {
    label: 'Company Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Corp',
    clauseTemplate: 'This agreement is made between {{companyName}} and the Advisor.',
    group: 'main'
  },
  companyAddress: {
    label: 'Company Address',
    type: 'textarea',
    required: true,
    placeholder: 'Full company address',
    clauseTemplate: 'The company\'s address is {{companyAddress}}.',
    group: 'main'
  },
  advisorName: {
    label: 'Advisor Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'The Advisor is {{advisorName}}.',
    group: 'main'
  },
  advisorAddress: {
    label: 'Advisor Address',
    type: 'textarea',
    required: true,
    placeholder: 'Full advisor address',
    clauseTemplate: 'The Advisor\'s address is {{advisorAddress}}.',
    group: 'main'
  },
  effectiveDate: {
    label: 'Effective Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement becomes effective on {{effectiveDate}}.',
    validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val),
    group: 'main'
  },
  agreementDurationValue: {
    label: 'Agreement Duration',
    type: 'number',
    required: false,
    placeholder: 'e.g. 12',
    clauseTemplate: '',
    group: 'main',
    inlineWith: 'agreementDurationUnit'
  },
  agreementDurationUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['days', 'weeks', 'months', 'years'],
    placeholder: 'Select unit',
    clauseTemplate: 'The term of this agreement is {{agreementDurationValue}} {{agreementDurationUnit}}.',
    group: 'main'
  },
  advisorRole: {
    label: 'Advisor Role',
    type: 'dropdown',
    required: true,
    options: [
      'Generic Advisor',
      'Financial Advisor',
      'Technology Advisor',
      'Legal Advisor',
      'Marketing Advisor',
      'Industry Expert'
    ],
    placeholder: 'Select advisor role',
    clauseTemplate: 'The Advisor will serve as a {{advisorRole}}.',
    group: 'main'
  },
  scopeOfWork: {
    label: 'Scope of Work',
    type: 'textarea',
    required: true,
    placeholder: 'Describe the advisory services to be provided',
    clauseTemplate: 'The Advisor\'s responsibilities include {{scopeOfWork}}.',
    group: 'main'
  },
  timeCommitmentValue: {
    label: 'Time Commitment',
    type: 'number',
    required: false,
    placeholder: 'e.g. 10',
    clauseTemplate: '',
    group: 'main',
    inlineWith: 'timeCommitmentUnit'
  },
  timeCommitmentUnit: {
    label: 'Time Unit',
    type: 'dropdown',
    required: false,
    options: ['hours/week', 'hours/month', 'days/week', 'days/month'],
    placeholder: 'Select unit',
    clauseTemplate: 'The Advisor will commit approximately {{timeCommitmentValue}} {{timeCommitmentUnit}}.',
    group: 'main'
  },
  compensationType: {
    label: 'Compensation Type',
    type: 'dropdown',
    required: true,
    options: ['Equity', 'Cash', 'Equity + Cash', 'None'],
    placeholder: 'Select compensation type',
    clauseTemplate: 'The Advisor will be compensated via {{compensationType}}.',
    group: 'main'
  },
  splitEquityGrant: {
    label: 'Split equity grant into initial and future portions',
    type: 'checkbox',
    required: false,
    default: 'false',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash',
    group: 'main'
  },
  initialEquityPercentage: {
    label: 'Initial Grant',
    type: 'number',
    required: false,
    placeholder: 'e.g. 0.25',
    clauseTemplate: 'The Advisor will receive an initial grant of {{initialEquityPercentage}}% equity.',
    showIf: (form: StartupAdvisoryFormData) => form.splitEquityGrant === true,
    group: 'main',
    inlineWith: 'initialEquityShares'
  },
  initialEquityShares: {
    label: 'Shares',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5000',
    clauseTemplate: 'The Advisor will receive an initial grant of {{initialEquityShares}} shares.',
    showIf: (form: StartupAdvisoryFormData) => form.splitEquityGrant === true,
    group: 'main'
  },
  // NEW: future grant fields
  futureEquityPercentage: {
    label: 'Future Grant',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1.25',
    clauseTemplate: 'The Advisor will receive a future grant of {{futureEquityPercentage}}% equity.',
    showIf: (form: StartupAdvisoryFormData) => form.splitEquityGrant === true,
    group: 'main',
    inlineWith: 'futureEquityShares'
  },
  futureEquityShares: {
    label: 'Shares',
    type: 'number',
    required: false,
    placeholder: 'e.g. 20000',
    clauseTemplate: 'The Advisor will receive a future grant of {{futureEquityShares}} shares.',
    showIf: (form: StartupAdvisoryFormData) => form.splitEquityGrant === true,
    group: 'main'
  },
  equityPercentage: {
    label: 'Equity Percentage',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1.5',
    clauseTemplate: 'The Advisor will receive {{equityPercentage}}% equity.',
    showIf: (form: StartupAdvisoryFormData) =>
      (form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash') &&
      form.splitEquityGrant === false,
    validate: (val: string, form?: StartupAdvisoryFormData) => {
      if (form?.compensationType === 'Equity' || form?.compensationType === 'Equity + Cash') {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      }
      return true;
    },
    group: 'main'
  },
  equityShares: {
    label: 'Equity Shares',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1000',
    clauseTemplate: 'The Advisor will receive {{equityShares}} shares.',
    showIf: (form: StartupAdvisoryFormData) =>
      (form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash') &&
      form.splitEquityGrant === false,
    group: 'main'
  },
  vestingStartDate: {
    label: 'Vesting Start Date',
    type: 'date',
    required: false, // conditional requirement handled via validate
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'Vesting will commence on {{vestingStartDate}}.',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash',
    validate: (_val: string, form?: StartupAdvisoryFormData) => {
      // Only runs when showIf is true
      return (
        typeof form?.vestingStartDate === 'string' &&
        form.vestingStartDate.trim() !== '' &&
        form.vestingStartDate.trim() !== 'MM/DD/YYYY'
      );
    },
    group: 'main'
  },
  cliffPeriodValue: {
    label: 'Cliff Period',
    type: 'number',
    required: false,
    placeholder: 'e.g. 6',
    clauseTemplate: '',
    group: 'main',
    inlineWith: 'cliffPeriodUnit',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash'
  },
  cliffPeriodUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['months', 'years'],
    placeholder: 'Select unit',
    clauseTemplate: 'The cliff period is {{cliffPeriodValue}} {{cliffPeriodUnit}}.',
    group: 'main',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash'
  },
  totalVestingPeriodValue: {
    label: 'Total Vesting Period',
    type: 'number',
    required: false,
    placeholder: 'e.g. 48',
    clauseTemplate: '',
    group: 'main',
    inlineWith: 'totalVestingPeriodUnit',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash'
  },
  totalVestingPeriodUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['months', 'years'],
    placeholder: 'Select unit',
    clauseTemplate: 'The total vesting period is {{totalVestingPeriodValue}} {{totalVestingPeriodUnit}}.',
    group: 'main',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Equity' || form.compensationType === 'Equity + Cash'
  },
  cashAmount: {
    label: 'Cash Amount',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2000.00',
    clauseTemplate: 'The Advisor will receive a cash payment of {{cashAmount}}.',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Cash' || form.compensationType === 'Equity + Cash',
    validate: (val: string, form?: StartupAdvisoryFormData) => {
      if (form?.compensationType === 'Cash' || form?.compensationType === 'Equity + Cash') {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }
      return true;
    },
    group: 'main'
  },
  initialPayment: {
    label: 'Initial Payment',
    type: 'number',
    required: false, // let validator enforce conditional requirement
    placeholder: 'e.g. 3000.00',
    clauseTemplate: '',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Cash' || form.compensationType === 'Equity + Cash',
    validate: (val: string, form?: StartupAdvisoryFormData) => {
      if (form?.compensationType === 'Cash' || form?.compensationType === 'Equity + Cash') {
        const total = form?.cashAmount ?? 0;

        // Treat as blank if null/empty string OR (0 and payout frequency is 'None')
        const isBlank =
          val == null ||
          String(val).trim() === '' ||
          (Number(val) === 0 &&
            (form?.ongoingPaymentFrequency ?? '').toLowerCase() === 'none');

        // Rule 4: If blank, treat as full upfront and accept if there's a cash amount
        if (isBlank) {
          return total > 0;
        }

        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= total;
      }
      return true;
    },
    group: 'main'
  },
  ongoingPaymentFrequency: {
    label: 'Payout Frequency',
    type: 'dropdown',
    required: false, // conditional in validate
    options: ['None', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Annually'],
    placeholder: 'Select ongoing frequency',
    default: 'None',
    clauseTemplate: '',
    showIf: (form: StartupAdvisoryFormData) =>
      form.compensationType === 'Cash' || form.compensationType === 'Equity + Cash',
    validate: (val: string, form?: StartupAdvisoryFormData) => {
      if (form?.compensationType === 'Cash' || form?.compensationType === 'Equity + Cash') {
        const total = form?.cashAmount ?? 0;

        const rawInit = form?.initialPayment;
        const freq = String(val ?? '').trim().toLowerCase();

        // Treat as blank if null/empty OR (0 and frequency is None)
        const isBlank =
          rawInit == null ||
          String(rawInit).trim() === '' ||
          (Number(rawInit) === 0 && freq === 'none');

        const init = isBlank ? total : Number(rawInit);

        if (init < total) {
          return !!val && val.trim() !== '' && freq !== 'none';
        }
      }
      return true;
    },
    group: 'main'
  },
  expenseReimbursement: {
    label: 'Reimbursement of Expenses',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'The Advisor will be reimbursed for reasonable expenses.',
    default: 'false',
    group: 'clauses'
  },
  expenseDetails: {
    label: 'Expense Details',
    type: 'textarea',
    required: false,
    placeholder: 'Describe reimbursable expenses',
    clauseTemplate: 'Reimbursable expenses include {{expenseDetails}}.',
    showIf: (form: StartupAdvisoryFormData) => form.expenseReimbursement,
    group: 'clauses'
  },
  ipOwnership: {
    label: 'IP Ownership',
    type: 'dropdown',
    required: true,
    options: ['Company', 'Advisor', 'Joint'],
    placeholder: 'Select IP ownership',
    clauseTemplate: 'Intellectual property created will be owned by {{ipOwnership}}.',
    group: 'main'
  },
  includeConfidentiality: {
    label: 'Include Confidentiality Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'A confidentiality clause is included.',
    default: 'true',
    group: 'clauses'
  },
  includeTerminationForCause: {
    label: 'Include Termination for Cause Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'A termination for cause clause is included.',
    default: 'true',
    group: 'clauses'
  },
  includeEntireAgreementClause: {
    label: 'Include Entire Agreement Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'An entire agreement clause is included.',
    default: 'true',
    group: 'clauses'
  },
  nonCompete: {
    label: 'Include Non-Compete Clause',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'A non-compete clause is included.',
    default: 'false',
    group: 'clauses'
  },
  nonCompeteDurationValue: {
    label: 'Duration',
    type: 'number',
    required: false,
    placeholder: 'e.g. 12',
    clauseTemplate: '',
    group: 'clauses',
    inlineWith: 'nonCompeteDurationUnit',
    showIf: (form: StartupAdvisoryFormData) => form.nonCompete
  },
  nonCompeteDurationUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['days', 'weeks', 'months', 'years'],
    placeholder: 'Select unit',
    clauseTemplate: 'The non-compete period is {{nonCompeteDurationValue}} {{nonCompeteDurationUnit}}.',
    group: 'clauses',
    showIf: (form: StartupAdvisoryFormData) => form.nonCompete
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
  disputeResolution: {
    label: 'Dispute Resolution',
    type: 'dropdown',
    required: true,
    options: ['Arbitration', 'Mediation', 'Court'],
    placeholder: 'Select dispute resolution method',
    clauseTemplate: 'Disputes will be resolved via {{disputeResolution}}.',
    group: 'main'
  },
  additionalProvisions: {
    label: 'Additional Terms',
    type: 'textarea',
    required: false,
    placeholder: 'Any additional terms or provisions',
    clauseTemplate: 'Additional provisions: {{additionalProvisions}}.',
    group: 'main'
  },
  companyRepName: {
    label: 'Company Rep Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Smith',
    clauseTemplate: 'Signed by {{companyRepName}}, representative of the Company.',
    group: 'main'
  },
  companyRepTitle: {
    label: 'Company Rep Title',
    type: 'text',
    required: true,
    placeholder: 'e.g. CEO',
    clauseTemplate: 'Title: {{companyRepTitle}}.',
    group: 'main'
  }
};
