// src/utils/parseAndValidateRealEstateContractForm.ts

import type { RealEstateContractFormData } from '../types/RealEstateContractFormData';
import type { RealEstateContractFieldConfig } from '../types/RealEstateContractFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';
import { validateInlinePair } from '@/utils/validateInlinePair';

export type RealEstateContractValidationErrors = Partial<
  Record<keyof RealEstateContractFormData, string>
>;

export function parseAndValidateRealEstateContractForm(
  rawFormData: RealEstateContractFormData,
  schema: Record<string, RealEstateContractFieldConfig>
): { parsed: RealEstateContractFormData; errors: RealEstateContractValidationErrors } {
  const errors: RealEstateContractValidationErrors = {};
  const parsedRaw: Partial<
    Record<
      keyof RealEstateContractFormData,
      RealEstateContractFormData[keyof RealEstateContractFormData]
    >
  > = {};

  // --- Generic per-field parsing + schema-driven validation ---
  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof RealEstateContractFormData;
    const rawValue = rawFormData[field];
    let parsedValue: unknown = rawValue;

    // Normalize values by type
    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
    }
    if (
      config.type === 'text' ||
      config.type === 'textarea' ||
      config.type === 'date'
    ) {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    }

    parsedRaw[field] = parsedValue as RealEstateContractFormData[typeof field];

    // Snapshot with parsed values for conditional checks
    const formSnapshot = { ...rawFormData, ...parsedRaw } as RealEstateContractFormData;

    // 🔹 Skip validation entirely if field is hidden
    const isVisible =
      typeof config.showIf === 'function'
        ? !!config.showIf(formSnapshot)
        : true;

    if (!isVisible) {
      continue; // hidden fields are ignored completely
    }

    // 🔹 Evaluate required and requiredIf only for visible fields
    const isRequired =
      config.required === true ||
      (typeof config.requiredIf === 'function' && config.requiredIf(formSnapshot));

    if (isRequired && isEmptyValue(parsedValue)) {
      errors[field] = `${config.label} is required.`;
      continue;
    }

    // 🔹 Run field-specific validation if provided
    if (config.validate) {
      const normalized = normalizeForValidation(parsedValue, config.type);
      const result = config.validate(normalized, formSnapshot);
      if (!result) {
        errors[field] = `${config.label} is invalid.`;
      }
    }
  }

  // --- Combined inline pair validation helpers ---
  const formSnapshot = { ...rawFormData, ...parsedRaw } as RealEstateContractFormData;

  // Required pairs (but only validated if visible in schema)
  validateInlinePair(
    formSnapshot,
    errors,
    'rentAmount',
    'paymentFrequency',
    'Rent Amount',
    false,
    schema
  );

  validateInlinePair(
    formSnapshot,
    errors,
    'commissionValue',
    'commissionUnit',
    'Commission',
    false,
    schema
  );

  return {
    parsed: parsedRaw as RealEstateContractFormData,
    errors,
  };
}
