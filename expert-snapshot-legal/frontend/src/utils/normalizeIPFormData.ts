// src/utils/normalizeIPFormData.ts

import type { IPRightsLicensingFormData, FeeStructure, IPType } from '../types/IPRightsLicensingFormData';

/**
 * Normalize incoming raw data into canonical form for storage/state.
 * Dates are preserved as ISO strings.
 */
export function normalizeIPFormData(raw: Record<string, any>): IPRightsLicensingFormData {
  return {
    inventorName: String(raw.inventorName ?? ''),
    clientName: String(raw.clientName ?? ''),
    providerName: String(raw.providerName ?? ''),
    effectiveDate: typeof raw.effectiveDate === 'string' ? raw.effectiveDate : '',
    executionDate: typeof raw.executionDate === 'string' ? raw.executionDate : '',
    expirationDate: typeof raw.expirationDate === 'string' ? raw.expirationDate : '',

    ipTitle: String(raw.ipTitle ?? ''),
    ipType: raw.ipType as IPType,
    matterDescription: String(raw.matterDescription ?? ''),
    licenseScope: String(raw.licenseScope ?? ''),
    jurisdiction: raw.jurisdiction ?? 'California',

    feeStructure: raw.feeStructure as FeeStructure,
    feeAmount: Number(raw.feeAmount ?? 0),
    retainerAmount: raw.retainerAmount !== undefined ? Number(raw.retainerAmount) : undefined,

    includeConfidentiality: raw.includeConfidentiality ?? false,
    includeInventionAssignment: raw.includeInventionAssignment ?? false,
  };
}

/**
 * Normalize form data for validation or display.
 * Dates are coerced into `yyyy-mm-dd` format if valid.
 */
export function normalizeRawIPFormData(data: IPRightsLicensingFormData): IPRightsLicensingFormData {
  const normalized: Partial<IPRightsLicensingFormData> = {};

  for (const key in data) {
    const field = key as keyof IPRightsLicensingFormData;
    const value = data[field];

    if (
      field === 'effectiveDate' ||
      field === 'executionDate' ||
      field === 'expirationDate'
    ) {
      normalized[field] = normalizeDate(value);
    } else {
      assign(normalized, field, value);
    }
  }

  return normalized as IPRightsLicensingFormData;
}

function assign<K extends keyof IPRightsLicensingFormData>(
  target: Partial<IPRightsLicensingFormData>,
  key: K,
  value: IPRightsLicensingFormData[K]
) {
  target[key] = value;
}

/**
 * Coerces a date string into ISO format (`yyyy-mm-dd`) if valid.
 * Accepts either ISO or `MM/DD/YYYY` format.
 */
function normalizeDate(input: unknown): string {
  if (typeof input !== 'string') return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}

