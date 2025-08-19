import { RetainerFormData, FeeStructure } from '../types/RetainerFormData';

function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

export function normalizeFormData(raw: Record<string, any>): RetainerFormData {
  return {
    providerName: String(raw.providerName ?? ''),
    clientName: String(raw.clientName ?? ''),
    feeAmount: Number(raw.feeAmount ?? 0),
    feeStructure: raw.feeStructure as FeeStructure,
    retainerAmount: raw.retainerAmount !== undefined ? Number(raw.retainerAmount) : undefined,
    startDate: parseDateLocal(raw.startDate ?? ''),
    endDate: parseDateLocal(raw.endDate ?? ''),
    matterDescription: String(raw.matterDescription ?? ''),
    jurisdiction: raw.jurisdiction ?? 'California',
  };
}

