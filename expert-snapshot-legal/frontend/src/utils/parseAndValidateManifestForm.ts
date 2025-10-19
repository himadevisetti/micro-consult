// src/utils/parseAndValidateManifestForm.ts

import type { ManifestVariable } from '@/types/manifest';
import { normalizeForValidation, isEmptyValue } from './formSchemaUtils';

export type ManifestValidationErrors = Partial<Record<string, string>>;

export function parseAndValidateManifestForm(
  rawFormData: Record<string, string>,
  variables: ManifestVariable[]
): { parsed: Record<string, string>; errors: ManifestValidationErrors } {
  const errors: ManifestValidationErrors = {};
  const parsedRaw: Record<string, string> = {};

  for (const v of variables) {
    const field = v.schemaField;
    const rawValue = rawFormData[field];
    let parsedValue: string = rawValue;

    // --- Type‑aware parsing ---
    if (v.inputType === 'currency') {
      // strip $ and commas, keep numeric string
      parsedValue = rawValue ? rawValue.replace(/[$,]/g, '') : '';
    } else if (v.inputType === 'date') {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : '';
    } else {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : '';
    }

    parsedRaw[field] = parsedValue;

    // --- Required check (all manifest variables are required by default) ---
    if (isEmptyValue(parsedValue)) {
      errors[field] = `${v.label} is required.`;
      continue;
    }

    // --- Type‑specific validation ---
    if (v.inputType === 'date') {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoDateRegex.test(parsedValue)) {
        errors[field] = `${v.label} must be a valid date (YYYY-MM-DD).`;
      }
    }

    if (v.inputType === 'currency') {
      const num = Number(parsedValue);
      if (!Number.isFinite(num) || num < 0) {
        errors[field] = `${v.label} must be a valid non‑negative amount.`;
      }
    }

    if (v.inputType === 'select') {
      if (isEmptyValue(parsedValue)) {
        errors[field] = `${v.label} is required.`;
      }
    }
  }

  return {
    parsed: parsedRaw,
    errors,
  };
}

