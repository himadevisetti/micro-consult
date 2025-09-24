// src/schemas/employmentAgreementSchema.ts

import type { EmploymentAgreementFormData, WorkScheduleEntry } from '../types/EmploymentAgreementFormData';
import { EmploymentAgreementFieldConfig } from '../types/EmploymentAgreementFieldConfig';

export const employmentAgreementSchema: Record<string, EmploymentAgreementFieldConfig> = {
  employerName: {
    label: 'Employer Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Corp',
    clauseTemplate: 'This Employment Agreement is made between {{employerName}} and the Employee.',
    group: 'main'
  },
  employerAddress: {
    label: 'Employer Address',
    type: 'textarea',
    required: true,
    placeholder: 'Full employer address',
    clauseTemplate: 'The Employer\'s address is {{employerAddress}}.',
    group: 'main'
  },
  employeeName: {
    label: 'Employee Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'The Employee is {{employeeName}}.',
    group: 'main'
  },
  employeeAddress: {
    label: 'Employee Address',
    type: 'textarea',
    required: true,
    placeholder: 'Full employee address',
    clauseTemplate: 'The Employee\'s address is {{employeeAddress}}.',
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
  bandOrGroup: {
    label: 'Band / Group',
    type: 'dropdown',
    required: true,
    options: ['Not Applicable', 'Band 1 - Entry', 'Band 2 - Mid', 'Band 3 - Senior', 'Executive'],
    placeholder: 'Select band or group',
    clauseTemplate: 'The Employee is classified as {{bandOrGroup}}.',
    group: 'main'
  },
  contractType: {
    label: 'Contract Type',
    type: 'dropdown',
    required: true,
    options: ['Permanent', 'Fixed-Term', 'Probationary', 'Part-Time', 'Temporary', 'Hourly'],
    placeholder: 'Select contract type',
    clauseTemplate: 'The Employee is engaged on a {{contractType}} basis.',
    group: 'main'
  },
  compensationType: {
    label: 'Compensation Type',
    type: 'dropdown',
    required: true,
    options: ['Salary', 'Hourly'],
    default: 'Salary',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Fixed-Term',
    group: 'main'
  },
  jobTitle: {
    label: 'Job Title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Software Engineer',
    clauseTemplate: 'The Employee will serve as {{jobTitle}}.',
    group: 'main'
  },
  department: {
    label: 'Department Name',
    type: 'text',
    required: false,
    placeholder: 'e.g. Engineering',
    clauseTemplate: 'The Employee will work in the {{department}} department.',
    group: 'main'
  },
  reportsTo: {
    label: 'Reports To',
    type: 'text',
    required: false,
    placeholder: 'e.g. CTO',
    clauseTemplate: 'The Employee will report to {{reportsTo}}.',
    group: 'main'
  },
  workLocation: {
    label: 'Work Location',
    type: 'dropdown',
    required: false,
    options: ['On-site', 'Remote', 'Hybrid'],
    placeholder: 'Select work location',
    clauseTemplate: 'The Employee\'s work location will be {{workLocation}}.',
    group: 'main'
  },
  workSchedule: {
    label: 'Work Schedule',
    type: 'inline-pair',
    required: false,
    pair: [
      {
        key: 'days',
        label: 'Days',
        type: 'multiselect',
        options: [
          { value: 'Mon', label: 'Monday' },
          { value: 'Tue', label: 'Tuesday' },
          { value: 'Wed', label: 'Wednesday' },
          { value: 'Thu', label: 'Thursday' },
          { value: 'Fri', label: 'Friday' },
          { value: 'Sat', label: 'Saturday' },
          { value: 'Sun', label: 'Sunday' },
        ],
      },
      {
        key: 'hours',
        label: 'Hours',
        type: 'time-range',
        step: 30, // minutes
        startLabel: 'Start time',
        endLabel: 'End time',
      },
    ],
    join: (entries: WorkScheduleEntry[]) =>
      entries
        .map(({ days, hours }) => `${days.join(', ')}: ${hours.start || ''}–${hours.end || ''}`)
        .filter(Boolean)
        .join('; '),
    clauseTemplate: 'The Employee\'s regular schedule will be {{workSchedule}}.',
    showIf: (form: EmploymentAgreementFormData) =>
      ['Probationary', 'Part-Time', 'Temporary', 'Hourly'].includes(form.contractType) ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Hourly'),
    group: 'main',
  },

  // Salary-based fields
  baseSalary: {
    label: 'Base Salary',
    type: 'number',
    required: false,
    placeholder: 'e.g. 60000',
    clauseTemplate: 'The Employee will receive a base salary of {{baseSalary}}.',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
    validate: (val: string, form?: EmploymentAgreementFormData) => {
      if (val === '' || val == null) return true;
      if (['Permanent', 'Fixed-Term', 'Probationary'].includes(form?.contractType || '')) {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      }
      return true;
    },
    group: 'main',
    inlineWith: 'payFrequency'
  },
  payFrequency: {
    label: 'Pay Frequency',
    type: 'dropdown',
    required: false,
    options: ['Weekly', 'Biweekly', 'Monthly'],
    placeholder: 'Select pay frequency',
    clauseTemplate: 'Salary will be paid {{payFrequency}}.',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
    group: 'main',
    validate: (val: string) => {
      if (val === '' || val == null) return true;
      return ['Weekly', 'Biweekly', 'Monthly'].includes(val);
    }
  },
  bonusAmount: {
    label: 'Bonus Amount',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5000',
    clauseTemplate: 'The Employee will receive a bonus of {{bonusAmount}} {{bonusUnit}}.',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
    group: 'main',
    inlineWith: 'bonusUnit',
    validate: (val: string) => {
      if (val === '' || val == null) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }
  },
  bonusUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['None', 'Quarterly', 'Annually'],
    default: 'None',
    group: 'main',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
  },
  benefitsList: {
    label: 'Benefits',
    type: 'textarea',
    required: false,
    placeholder: 'Click one or more benefits above to select',
    suggestions: [
      'Health Insurance',
      'Retirement Plan',
      'Paid Time Off',
      'Gym Membership',
      'Professional Development Allowance'
    ],
    clauseTemplate: 'The Employee will receive the following benefits: {{benefitsList}}.',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
    group: 'main'
  },
  annualLeaveDays: {
    label: 'Annual Leave Days',
    type: 'number',
    required: true,
    placeholder: 'e.g. 20',
    clauseTemplate: 'The Employee is entitled to {{annualLeaveDays}} days of annual leave.',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
    validate: (val: string) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0; // must be a number >= 0
    },
    group: 'main'
  },

  sickLeaveDays: {
    label: 'Sick Leave Days',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10',
    clauseTemplate: 'The Employee is entitled to {{sickLeaveDays}} days of sick leave.',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
    validate: (val: string) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0; // must be a number >= 0
    },
    group: 'main'
  },
  probationPeriod: {
    label: 'Probation Period',
    type: 'number',
    required: false,
    placeholder: 'e.g. 3 (0 indicates no probation)',
    clauseTemplate: 'The probation period will be {{probationPeriod}} months.',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary'),
    validate: (val: string) => {
      if (val === '' || val == null) return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    },
    group: 'main',
    inlineWith: 'probationPeriodUnit'
  },
  probationPeriodUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['Months'], // Title Case
    default: 'Months',
    disabled: true,
    group: 'main',
    showIf: (form: EmploymentAgreementFormData) =>
      form.contractType === 'Permanent' ||
      form.contractType === 'Probationary' ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Salary')
  },
  noticePeriodEmployer: {
    label: 'Employer',
    type: 'number',
    required: false,
    placeholder: 'e.g. 4',
    clauseTemplate: 'The Employer must give {{noticePeriodEmployer}} {{noticePeriodEmployerUnit}} notice.',
    validate: (val: string) => {
      if (val === '' || val == null) return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    },
    group: 'main',
    inlineWith: 'noticePeriodEmployerUnit'
  },
  noticePeriodEmployerUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['Weeks', 'Months'],
    default: 'Weeks',
    group: 'main'
  },
  noticePeriodEmployee: {
    label: 'Employee',
    type: 'number',
    required: false,
    placeholder: 'e.g. 4',
    clauseTemplate: 'The Employee must give {{noticePeriodEmployee}} {{noticePeriodEmployeeUnit}} notice.',
    validate: (val: string) => {
      if (val === '' || val == null) return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    },
    group: 'main',
    inlineWith: 'noticePeriodEmployeeUnit'
  },
  noticePeriodEmployeeUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['Weeks', 'Months'],
    default: 'Weeks',
    group: 'main'
  },

  // Hourly-based fields
  hourlyRate: {
    label: 'Hourly Rate',
    type: 'number',
    required: false,
    placeholder: 'e.g. 40',
    clauseTemplate: 'The Employee will be paid {{hourlyRate}} per hour.',
    showIf: (form: EmploymentAgreementFormData) =>
      ['Temporary', 'Hourly', 'Part-Time'].includes(form.contractType) ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Hourly'),
    // disable schema-level validation; backend will validate both fields together
    validate: () => true,
    group: 'main',
    inlineWith: 'hoursPerWeek'
  },
  hoursPerWeek: {
    label: 'Hours per Week',
    type: 'number',
    required: false,
    placeholder: 'Hours per week (e.g. 20)',
    clauseTemplate: 'The Employee will work {{hoursPerWeek}} hours per week.',
    showIf: (form: EmploymentAgreementFormData) =>
      ['Temporary', 'Hourly', 'Part-Time'].includes(form.contractType) ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Hourly'),
    // disable schema-level validation; backend will validate both fields together
    validate: () => true,
    group: 'main'
  },
  contractDurationValue: {
    label: 'Contract Duration',
    type: 'number',
    required: false,
    placeholder: 'e.g. 6',
    clauseTemplate: '',
    group: 'main',
    inlineWith: 'contractDurationUnit',
    showIf: (form: EmploymentAgreementFormData) =>
      ['Temporary', 'Hourly'].includes(form.contractType) ||
      form.contractType === 'Fixed-Term',
    // Disable schema-level validation; handled in parseAndValidateEmploymentAgreementForm.ts
    validate: () => true
  },
  contractDurationUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['Weeks', 'Months', 'Years'],
    default: 'Months',
    placeholder: 'Select unit',
    clauseTemplate: 'The contract duration is {{contractDurationValue}} {{contractDurationUnit}}.',
    group: 'main',
    showIf: (form: EmploymentAgreementFormData) =>
      ['Temporary', 'Hourly'].includes(form.contractType) ||
      form.contractType === 'Fixed-Term'
  },
  overtimePolicy: {
    label: 'Overtime Policy',
    type: 'textarea',
    required: false,
    placeholder: 'Describe overtime policy',
    clauseTemplate: 'Overtime will be handled as follows: {{overtimePolicy}}.',
    group: 'main',
    showIf: (form: EmploymentAgreementFormData) =>
      ['Temporary', 'Hourly', 'Part-Time'].includes(form.contractType) ||
      (form.contractType === 'Fixed-Term' && form.compensationType === 'Hourly')
  },

  // Clause toggles
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
    showIf: (form: EmploymentAgreementFormData) => form.nonCompete
  },
  nonCompeteDurationUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['Days', 'Weeks', 'Months', 'Years'], // Title Case
    default: 'Months',
    placeholder: 'Select unit',
    clauseTemplate: 'The non-compete period is {{nonCompeteDurationValue}} {{nonCompeteDurationUnit}}.',
    group: 'clauses',
    showIf: (form: EmploymentAgreementFormData) => form.nonCompete
  },
  nonCompeteScope: {
    label: 'Scope',
    type: 'textarea',
    required: false,
    placeholder: 'Describe scope of non-compete',
    clauseTemplate: 'The non-compete scope is: {{nonCompeteScope}}.',
    group: 'clauses',
    showIf: (form: EmploymentAgreementFormData) => form.nonCompete
  },
  nonSolicitation: {
    label: 'Include Non-Solicitation Clause',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'A non-solicitation clause is included.',
    default: 'false',
    group: 'clauses'
  },
  includeConfidentiality: {
    label: 'Include Confidentiality Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'A confidentiality clause is included.',
    default: 'true',
    group: 'clauses'
  },
  includeIPOwnership: {
    label: 'Include IP Ownership Clause',
    type: 'checkbox',
    required: true,
    clauseTemplate: 'An intellectual property ownership clause is included.',
    default: 'true',
    group: 'clauses'
  },

  // Miscellaneous
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

  // Signatures
  employerSignatoryName: {
    label: 'Company Rep Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. John Smith',
    clauseTemplate: 'Signed by {{employerSignatoryName}}, representative of the Employer.',
    group: 'main'
  },
  employerSignatoryTitle: {
    label: 'Company Rep Title',
    type: 'text',
    required: true,
    placeholder: 'e.g. CHRO',
    clauseTemplate: 'Title: {{employerSignatoryTitle}}.',
    group: 'main'
  }
};
