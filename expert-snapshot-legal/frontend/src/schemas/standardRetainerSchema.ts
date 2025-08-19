import type { RetainerFormData } from '../types/RetainerFormData.js';

export interface RetainerFieldConfig {
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  clauseTemplate?: string;
  options?: string[];
  validate?: (val: string, form?: RetainerFormData) => boolean;
  default?: string;
}

export const standardRetainerSchema: Record<string, RetainerFieldConfig> = {
  clientName: { label: 'Client Name', type: 'text', required: true, placeholder: 'e.g. Acme Corp', clauseTemplate: 'This agreement is made with {{clientName}}.' },
  providerName: { label: 'Provider Name', type: 'text', required: true, placeholder: 'e.g. Jane Doe Law Firm', clauseTemplate: 'The provider of legal services is {{providerName}}.' },
  feeAmount: {
    label: 'Fee Amount',
    type: 'text',
    required: true,
    placeholder: 'e.g. $2000.00',
    clauseTemplate: 'The total fee is {{feeAmount}}.',
    validate: (val: string) => {
      const sanitized = val.replace(/[^0-9.]/g, '');
      const num = parseFloat(sanitized);
      return (
        !isNaN(num) &&
        num >= 0 &&
        /^\d+(\.\d{1,2})?$/.test(sanitized)
      );
    }
  },
  feeStructure: {
    label: 'Fee Structure',
    type: 'dropdown',
    required: true,
    placeholder: 'Select fee structure',
    options: ['Flat', 'Hourly', 'Monthly', 'Contingency'],
    clauseTemplate: 'The client agrees to a fee structure of {{feeStructure}}.',
    default: 'Flat'
  },
  retainerAmount: {
    label: 'Retainer Amount (Optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. $5,000.00',
    clauseTemplate: 'A one-time retainer fee of {{retainerAmount}} will be charged.',
    validate: (val: string) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(val);
    },
    default: '0'
  },
  startDate: {
    label: 'Start Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The agreement begins on {{startDate}}.',
    validate: (val: string) => {
      const date = new Date(val);
      return typeof val === 'string' && !isNaN(date.getTime());
    }
  },
  endDate: {
    label: 'End Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The agreement ends on {{endDate}}.',
    validate: (val: string, form?: RetainerFormData) => {
      if (!val || !form?.startDate) return false;
      const end = new Date(val);
      const start = new Date(form.startDate);
      return !isNaN(end.getTime()) && !isNaN(start.getTime()) && end >= start;
    }
  },
  jurisdiction: {
    label: 'Jurisdiction',
    type: 'dropdown',
    required: false,
    placeholder: 'Select jurisdiction',
    options: ['California', 'New York', 'Texas', 'Other'],
    clauseTemplate: 'This agreement is governed by the laws of {{jurisdiction}}.',
    default: 'California'
  },
  matterDescription: {
    label: 'Matter Description',
    type: 'text',
    required: true,
    placeholder: 'e.g. IP Licensing Agreement',
    clauseTemplate: 'The purpose of this retainer is {{matterDescription}}.'
  }
};
