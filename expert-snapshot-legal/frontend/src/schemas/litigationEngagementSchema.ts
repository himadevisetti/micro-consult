// src/schemas/litigationEngagementSchema.ts

import type { LitigationEngagementFormData } from '../types/LitigationEngagementFormData';
import { LitigationEngagementFieldConfig } from '../types/LitigationEngagementFieldConfig';

export const litigationEngagementSchema: Record<string, LitigationEngagementFieldConfig> = {
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
    placeholder: 'e.g. John Doe Law Firm',
    clauseTemplate: 'The provider of litigation services is {{providerName}}.'
  },
  caseCaption: {
    label: 'Case Caption',
    type: 'text',
    required: false, // optional at intake, enforced post-filing
    placeholder: 'e.g. Doe v. Smith',
    clauseTemplate: 'The matter caption is {{caseCaption}}.'
  },
  caseNumber: {
    label: 'Case Number',
    type: 'text',
    required: false, // optional at intake, enforced post-filing
    placeholder: 'e.g. 2025-CV-12345',
    clauseTemplate: 'The docket number is {{caseNumber}}.'
  },
  courtName: {
    label: 'Court Name',
    type: 'text',
    required: false,
    placeholder: 'e.g. Superior Court of California',
    clauseTemplate: 'The venue is {{courtName}}.'
  },
  courtAddress: {
    label: 'Court Address',
    type: 'text',
    required: false,
    placeholder: 'e.g. 123 Main St, Oakland, CA 94612',
    clauseTemplate: 'The court is located at {{courtAddress}}.'
  },
  countyName: {
    label: 'County Name',
    type: 'text',
    required: false,
    placeholder: 'e.g. Alameda County',
    clauseTemplate: 'The county of venue is {{countyName}}.'
  },

  // --- Dates section ---
  executionDate: {
    label: 'Execution Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The agreement was executed on {{executionDate}}.',
    validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  filedDate: {
    label: 'Filed Date',
    type: 'date',
    required: false, // optional at intake, enforced post-filing
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The case was filed on {{filedDate}}.',
    validate: (val: string) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  effectiveDate: {
    label: 'Effective Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement becomes effective on {{effectiveDate}}.',
    validate: (val: string) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  expirationDate: {
    label: 'Expiration Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This agreement terminates on {{expirationDate}}.',
    validate: (val: string, form?: LitigationEngagementFormData) => {
      if (!val) return true;
      if (!form?.executionDate) return /^\d{4}-\d{2}-\d{2}$/.test(val);
      const isValidFormat =
        /^\d{4}-\d{2}-\d{2}$/.test(val) &&
        /^\d{4}-\d{2}-\d{2}$/.test(form.executionDate);
      return isValidFormat && val >= form.executionDate;
    }
  },

  // --- Fees & Retainer ---
  feeAmount: {
    label: 'Fee Amount',
    type: 'number',
    required: true,
    placeholder: 'e.g. 1000.00',
    clauseTemplate: 'The fee amount is {{feeAmount}}.',
    validate: (val: string) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(val.trim());
    }
  },
  feeStructure: {
    label: 'Fee Structure',
    type: 'dropdown',
    required: true,
    options: ['Flat', 'Hourly', 'Monthly', 'Contingency'],
    placeholder: 'Select fee structure',
    clauseTemplate: 'The client agrees to a fee structure of {{feeStructure}}.',
    default: 'Flat'
  },
  retainerAmount: {
    label: 'Retainer Amount',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5000.00',
    clauseTemplate: 'A retainer of {{retainerAmount}} is required.',
    validate: (val: string) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(val.trim());
    },
    default: '0'
  },

  // --- Scope & Limitations ---
  scopeOfRepresentation: {
    label: 'Scope of Representation',
    type: 'textarea',
    required: true,
    placeholder: 'Describe the scope of litigation services',
    clauseTemplate: 'The scope of representation includes {{scopeOfRepresentation}}.'
  },
  limitationsOfRepresentation: {
    label: 'Limitations of Representation',
    type: 'textarea',
    required: false,
    placeholder: 'Specify any limitations on representation',
    clauseTemplate: 'Representation is limited to {{limitationsOfRepresentation}}.'
  },

  // --- Jurisdiction ---
  jurisdiction: {
    label: 'Jurisdiction',
    type: 'dropdown',
    required: true,
    options: ['California', 'New York', 'Texas', 'Other'],
    placeholder: 'Select jurisdiction',
    clauseTemplate: 'This agreement is governed by the laws of {{jurisdiction}}.',
    default: 'California'
  },

  // --- Clause Toggles ---
  clientTerminationRights: {
    label: 'Include Client Termination Rights',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'The client retains the right to terminate representation.',
    default: 'false'
  },
  conflictOfInterestWaiver: {
    label: 'Include Conflict of Interest Waiver',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'A conflict of interest waiver is included.',
    default: 'false'
  }
};
