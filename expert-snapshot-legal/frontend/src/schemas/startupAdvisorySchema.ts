// src/types/startupAdvisorySchema.ts

import type { StartupAdvisoryFormData } from '../types/StartupAdvisoryFormData';
import { StartupAdvisoryFieldConfig } from '../types/StartupAdvisoryFieldConfig';

export const startupAdvisorySchema: Record<string, StartupAdvisoryFieldConfig> = {
  companyName: {
    label: 'Company Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Corp',
    clauseTemplate: 'This agreement is made between {{companyName}} and the Advisor.'
  },
  companyAddress: {
    label: 'Company Address',
    type: 'textarea',
    required: true,
    placeholder: 'Full company address',
    clauseTemplate: 'The company\'s address is {{companyAddress}}.'
  },
  advisorName: {
    label: 'Advisor Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'The Advisor is {{advisorName}}.'
  },
  advisorAddress: {
    label: 'Advisor Address',
    type: 'textarea',
    required: true,
    placeholder: 'Full advisor address',
    clauseTemplate: 'The Advisor\'s address is {{advisorAddress}}.'
  },
  effectiveDate: {
    label: 'Effective Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement becomes effective on {{effectiveDate}}.',
    validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  agreementDuration: {
    label: 'Agreement Duration',
    type: 'text',
    required: true,
    placeholder: 'e.g. 12 months',
    clauseTemplate: 'The term of this agreement is {{agreementDuration}}.'
  },
  advisorRole: {
    label: 'Advisor Role/Type',
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
    placeholder: 'Select advisor role/type',
    clauseTemplate: 'The Advisor will serve as a {{advisorRole}}.'
  },
  scopeOfWork: {
    label: 'Scope of Work / Responsibilities',
    type: 'textarea',
    required: true,
    placeholder: 'Describe the advisory services to be provided',
    clauseTemplate: 'The Advisor\'s responsibilities include {{scopeOfWork}}.'
  },
  timeCommitment: {
    label: 'Expected Time Commitment',
    type: 'text',
    required: true,
    placeholder: 'e.g. 10 hours/month',
    clauseTemplate: 'The Advisor will commit approximately {{timeCommitment}}.'
  },
  compensationType: {
    label: 'Compensation Type',
    type: 'dropdown',
    required: true,
    options: ['Equity', 'Cash', 'Equity + Cash', 'None'],
    placeholder: 'Select compensation type',
    clauseTemplate: 'The Advisor will be compensated via {{compensationType}}.'
  },
  equityPercentage: {
    label: 'Equity Percentage',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1.5',
    clauseTemplate: 'The Advisor will receive {{equityPercentage}}% equity.',
    validate: (val: string, form?: StartupAdvisoryFormData) => {
      if (form?.compensationType === 'Equity' || form?.compensationType === 'Equity + Cash') {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      }
      return true;
    }
  },
  equityShares: {
    label: 'Equity Shares',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1000',
    clauseTemplate: 'The Advisor will receive {{equityShares}} shares.'
  },
  vestingStartDate: {
    label: 'Vesting Start Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'Vesting will commence on {{vestingStartDate}}.'
  },
  cliffPeriod: {
    label: 'Cliff Period',
    type: 'text',
    required: false,
    placeholder: 'e.g. 6 months',
    clauseTemplate: 'The agreement includes a cliff period of {{cliffPeriod}}.'
  },
  totalVestingPeriod: {
    label: 'Total Vesting Period',
    type: 'text',
    required: false,
    placeholder: 'e.g. 24 months',
    clauseTemplate: 'The total vesting period is {{totalVestingPeriod}}.'
  },
  cashAmount: {
    label: 'Cash Amount',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2000.00',
    clauseTemplate: 'The Advisor will receive a cash payment of {{cashAmount}}.',
    validate: (val: string, form?: StartupAdvisoryFormData) => {
      if (form?.compensationType === 'Cash' || form?.compensationType === 'Equity + Cash') {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }
      return true;
    }
  },
  paymentFrequency: {
    label: 'Payment Frequency',
    type: 'dropdown',
    required: false,
    options: ['Monthly', 'Quarterly', 'One-time'],
    placeholder: 'Select payment frequency',
    clauseTemplate: 'Payments will be made on a {{paymentFrequency}} basis.'
  },
  expenseReimbursement: {
    label: 'Reimbursement of Expenses',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'The Advisor will be reimbursed for reasonable expenses.',
    default: 'false'
  },
  expenseDetails: {
    label: 'Expense Details',
    type: 'textarea',
    required: false,
    placeholder: 'Describe reimbursable expenses',
    clauseTemplate: 'Reimbursable expenses include {{expenseDetails}}.'
  },
  includeConfidentiality: {
    label: 'Include Confidentiality Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'A confidentiality clause is included.',
    default: 'true'
  },
  ipOwnership: {
    label: 'Intellectual Property Ownership',
    type: 'dropdown',
    required: true,
    options: ['Company', 'Advisor', 'Joint'],
    placeholder: 'Select IP ownership',
    clauseTemplate: 'Intellectual property created will be owned by {{ipOwnership}}.'
  },
  nonCompete: {
    label: 'Include Non-Compete Clause',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'A non-compete clause is included.',
    default: 'false'
  },
  nonCompeteDuration: {
    label: 'Non-Compete Duration',
    type: 'text',
    required: false,
    placeholder: 'e.g. 12 months',
    clauseTemplate: 'The non-compete period is {{nonCompeteDuration}}.'
  },
  terminationNoticePeriod: {
    label: 'Termination Notice Period',
    type: 'text',
    required: true,
    placeholder: 'e.g. 30 days',
    clauseTemplate: 'Either party may terminate with {{terminationNoticePeriod}} notice.'
  },
  includeTerminationForCause: {
    label: 'Include Termination for Cause Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'A termination for cause clause is included.',
    default: 'true'
  },
  governingLaw: {
    label: 'Governing Law / Jurisdiction',
    type: 'dropdown',
    required: true,
    options: ['California', 'New York', 'Texas', 'Other'],
    placeholder: 'Select governing law',
    clauseTemplate: 'This agreement is governed by the laws of {{governingLaw}}.',
    default: 'California'
  },
  disputeResolution: {
    label: 'Dispute Resolution Method',
    type: 'dropdown',
    required: true,
    options: ['Arbitration', 'Mediation', 'Court'],
    placeholder: 'Select dispute resolution method',
    clauseTemplate: 'Disputes will be resolved via {{disputeResolution}}.'
  },
  includeEntireAgreementClause: {
    label: 'Include Entire Agreement Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'An entire agreement clause is included.',
    default: 'true'
  },
  additionalProvisions: {
    label: 'Additional Provisions',
    type: 'textarea',
    required: false,
    placeholder: 'Any additional terms or provisions',
    clauseTemplate: 'Additional provisions: {{additionalProvisions}}.'
  },
  companyRepName: {
    label: 'Company Representative Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Smith',
    clauseTemplate: 'Signed by {{companyRepName}}, representative of the Company.'
  },
  companyRepTitle: {
    label: 'Company Representative Title',
    type: 'text',
    required: true,
    placeholder: 'e.g. CEO',
    clauseTemplate: 'Title: {{companyRepTitle}}.'
  },
  companySignature: {
    label: 'Company Signature',
    type: 'signature',
    required: true,
    placeholder: 'Sign for and on behalf of the Company',
    clauseTemplate: 'Company Signature: {{companySignature}}.'
  },
  advisorSignature: {
    label: 'Advisor Signature',
    type: 'signature',
    required: true,
    placeholder: 'Advisor to sign here',
    clauseTemplate: 'Advisor Signature: {{advisorSignature}}.'
  },
  dateSigned: {
    label: 'Date Signed',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'Executed on {{dateSigned}}.',
    validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  }
};


