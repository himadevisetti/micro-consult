// src/utils/normalizeValue.ts

import { formatDateLong } from './formatDate.js';

export function normalizeValue(val: unknown): string {
  if (val instanceof Date) {
    return formatDateLong(val);
  }

  if (typeof val === 'number') {
    return val.toString();
  }

  return (val as string | undefined) ?? '';
}

export function normalizeBySchema(raw: string, schemaField: string | null): string {
  if (!raw) return raw;

  switch (schemaField) {
    case "ExecutionDate":
    case "EffectiveDate":
    case "ExpirationDate":
      // canonical ISO date
      return new Date(raw).toISOString().split("T")[0];

    case "ContractDuration":
      // normalize spacing
      return raw.trim().replace(/\s+/g, " ");

    default:
      return raw.trim();
  }
}