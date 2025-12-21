// src/utils/validationHelpers.ts

import type { RealEstateContractFormData } from '../types/RealEstateContractFormData';
import type { RealEstateContractFieldConfig } from '../types/RealEstateContractFieldConfig';

/** Validate ISO date string (YYYY-MM-DD). */
export function validateDate(val: string): boolean {
  if (val === '' || val == null) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(val);
}

/** Validate numeric field (must be > 0). */
export function validatePositiveNumber(val: string): boolean {
  if (val === '' || val == null) return true;
  const num = parseFloat(val);
  return !isNaN(num) && num > 0;
}

/** Validate numeric field (must be >= 0). */
export function validateNonNegativeNumber(val: string): boolean {
  if (val === '' || val == null) return true;
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0;
}

/** Validate dropdown selection against allowed options. */
export function validateDropdown(val: string, options: string[]): boolean {
  if (val === '' || val == null) return true;
  return options.includes(val);
}

/** Validate free-form text (non-empty if provided). */
export function validateText(val: string): boolean {
  if (val === '' || val == null) return true;
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Generic field validator that respects required and requiredIf.
 * Returns an error message string if invalid, otherwise null.
 */
export function validateField(
  fieldKey: string,
  value: any,
  formData: RealEstateContractFormData,
  config: RealEstateContractFieldConfig
): string | null {
  const isRequired =
    config.required === true ||
    (typeof config.requiredIf === 'function' && config.requiredIf(formData));

  if (isRequired && (value == null || value === '')) {
    return `${config.label} is required.`;
  }

  if (config.validate && !config.validate(value, formData)) {
    return `${config.label} is invalid.`;
  }

  return null;
}
