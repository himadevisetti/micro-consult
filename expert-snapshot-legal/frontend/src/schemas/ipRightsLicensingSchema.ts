// src/types/ipRightsLicensingSchema.ts

import type { IPRightsLicensingFormData } from '../types/IPRightsLicensingFormData';
import { IPRetainerFieldConfig } from '../types/IPRetainerFieldConfig';

export const ipRightsLicensingSchema: Record<string, IPRetainerFieldConfig> = {
  inventorName: {
    label: 'Inventor Name',
    type: 'text',
    required: true,
    placeholder: 'Comma-separated names (e.g., Alice Smith, Bob Lee)',
    clauseTemplate: 'This agreement is made with {{inventorName}}.',
    validate: (val: string, form?: IPRightsLicensingFormData) => {
      if (form?.ipType === 'Patent' || form?.ipType === 'Trade Secret') {
        return typeof val === 'string' && val.trim().length > 0;
      }
      return true;
    }
  },
  clientName: {
    label: 'Client Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Corp',
    clauseTemplate: 'This agreement is made with {{clientName}}.'
  },
  providerName: {
    label: 'Provider Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe IP Counsel',
    clauseTemplate: 'The provider of IP legal services is {{providerName}}.'
  },
  filingEntity: {
    label: 'Filing Party',
    type: 'dropdown',
    required: true,
    options: ['Inventor', 'Client'],
    placeholder: 'Select who is filing',
    clauseTemplate: 'The filing party is {{filingEntity}}.',
    default: 'Client'
  },
  effectiveDate: {
    label: 'Effective Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement becomes effective on {{effectiveDate}}.',
    validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  executionDate: {
    label: 'Execution Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The agreement was executed on {{executionDate}}.',
    validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  expirationDate: {
    label: 'IP Expiration Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The IP rights are valid through {{expirationDate}}.',
    validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  ipTitle: {
    label: 'IP Title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Patent for XYZ',
    clauseTemplate: 'This agreement pertains to {{ipTitle}}.'
  },
  ipType: {
    label: 'IP Type',
    type: 'dropdown',
    required: true,
    options: ['Patent', 'Trademark', 'Copyright', 'Trade Secret'],
    placeholder: 'Select IP type',
    clauseTemplate: 'The subject matter is classified as {{ipType}}.'
  },
  matterDescription: {
    label: 'Matter Description',
    type: 'text',
    required: false,
    placeholder: 'e.g. Filing and enforcement of IP',
    clauseTemplate: 'The scope of representation includes {{matterDescription}}.'
  },
  licenseScope: {
    label: 'License Scope',
    type: 'text',
    required: true,
    placeholder: 'e.g. non-exclusive, worldwide, perpetual',
    clauseTemplate: 'The license granted is {{licenseScope}}.'
  },
  jurisdiction: {
    label: 'Jurisdiction',
    type: 'dropdown',
    required: true,
    options: ['California', 'New York', 'Texas', 'Other'],
    placeholder: 'Select jurisdiction',
    clauseTemplate: 'This agreement is governed by the laws of {{jurisdiction}}.',
    default: 'California'
  },
  feeStructure: {
    label: 'Fee Structure',
    type: 'dropdown',
    required: false,
    options: ['Flat', 'Hourly', 'Monthly', 'Contingency'],
    placeholder: 'Select fee structure',
    clauseTemplate: 'The client agrees to a fee structure of {{feeStructure}}.'
  },
  feeAmount: {
    label: 'Fee Amount',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2000.00',
    clauseTemplate: 'The total fee is {{feeAmount}}.',
    validate: (val: string) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(val.trim());
    }
  },
  retainerAmount: {
    label: 'Retainer Amount',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5000.00',
    clauseTemplate: 'A one-time retainer fee of {{retainerAmount}} will be charged.',
    validate: (val: string) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(val.trim());
    },
    default: '0'
  },
  includeConfidentiality: {
    label: 'Include Confidentiality Clause',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'A confidentiality clause is included.',
    default: 'false'
  },
  includeInventionAssignment: {
    label: 'Include Invention Assignment Clause',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'An invention assignment clause is included.',
    default: 'false'
  }
};

