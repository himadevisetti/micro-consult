// src/types/IPRightsLicensingFormData.ts

export type IPType = 'Patent' | 'Trademark' | 'Copyright' | 'Trade Secret';
export type FeeStructure = 'Flat' | 'Hourly' | 'Monthly' | 'Contingency';

export interface IPRightsLicensingFormData {
  // Parties & Dates
  inventorName?: string;
  clientName: string;
  providerName: string;
  effectiveDate: string;     // ISO format: YYYY-MM-DD
  executionDate: string;     // ISO format
  expirationDate: string;    // ISO format

  // IP Description & Scope
  ipTitle: string;
  ipType: IPType;
  matterDescription?: string;
  licenseScope: string;
  jurisdiction: string;

  // Financial Terms (optional)
  feeStructure?: FeeStructure;
  feeAmount?: number;
  retainerAmount?: number;

  // Clause Toggles
  includeConfidentiality?: boolean;
  includeInventionAssignment?: boolean;
}

export const defaultIPRightsLicensingFormData: IPRightsLicensingFormData = {
  inventorName: '',
  clientName: '',
  providerName: '',
  effectiveDate: '',
  executionDate: '',
  expirationDate: '',
  ipTitle: '',
  ipType: 'Patent',
  licenseScope: '',
  jurisdiction: 'California',
  matterDescription: '',
  feeStructure: 'Flat',
  feeAmount: 0.0,
  retainerAmount: 0.0,
  includeConfidentiality: false,
  includeInventionAssignment: false,
};

