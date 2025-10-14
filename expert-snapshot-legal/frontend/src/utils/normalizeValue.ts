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

// Canonical heading normalization used across anchors, extractors, and merging
export function normalizeHeading(h?: string): string {
  return (h ?? "")
    .replace(/\u00A0/g, " ") // NBSP -> space
    .replace(/&/g, "and")    // unify ampersand
    .trim()
    .replace(/\s+/g, " ")    // collapse spaces
    .toLowerCase();
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