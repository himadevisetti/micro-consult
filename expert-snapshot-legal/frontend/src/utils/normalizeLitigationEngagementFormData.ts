// src/utils/normalizeLitigationEngagementFormData.ts

import type { LitigationEngagementFormData, FeeStructure } from '../types/LitigationEngagementFormData';
import { normalizeFormDates } from './normalizeFormDates';

/**
 * Normalize incoming raw data into canonical form for storage/state.
 */
export function normalizeLitigationEngagementFormData(
  raw: Record<string, any>
): LitigationEngagementFormData {
  const base: LitigationEngagementFormData = {
    clientName: String(raw.clientName ?? ''),
    providerName: String(raw.providerName ?? ''),
    caseCaption: raw.caseCaption ? String(raw.caseCaption) : '',
    caseNumber: raw.caseNumber ? String(raw.caseNumber) : '',
    courtName: raw.courtName ? String(raw.courtName) : '',
    courtAddress: raw.courtAddress ? String(raw.courtAddress) : '',
    countyName: raw.countyName ? String(raw.countyName) : '',

    executionDate: typeof raw.executionDate === 'string' ? raw.executionDate : '',
    effectiveDate: typeof raw.effectiveDate === 'string' ? raw.effectiveDate : '',
    expirationDate: typeof raw.expirationDate === 'string' ? raw.expirationDate : '',
    filedDate: typeof raw.filedDate === 'string' ? raw.filedDate : '',

    feeAmount: Number(raw.feeAmount ?? 0),
    feeStructure: raw.feeStructure as FeeStructure,
    retainerAmount: raw.retainerAmount !== undefined ? Number(raw.retainerAmount) : undefined,

    scopeOfRepresentation: String(raw.scopeOfRepresentation ?? ''),
    limitationsOfRepresentation: raw.limitationsOfRepresentation ? String(raw.limitationsOfRepresentation) : '',

    jurisdiction: raw.jurisdiction ?? 'California',

    clientTerminationRights: raw.clientTerminationRights ?? false,
    conflictOfInterestWaiver: raw.conflictOfInterestWaiver ?? false,
  };

  return normalizeFormDates(base, [
    'executionDate',
    'effectiveDate',
    'expirationDate',
    'filedDate',
  ]);
}

/**
 * Normalize already‑typed form data for validation/display.
 */
export function normalizeRawLitigationEngagementFormData(
  data: LitigationEngagementFormData
): LitigationEngagementFormData {
  return normalizeFormDates(data, [
    'executionDate',
    'effectiveDate',
    'expirationDate',
    'filedDate',
  ]);
}
