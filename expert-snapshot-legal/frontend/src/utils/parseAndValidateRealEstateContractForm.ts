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

    // Skip validation if field is hidden
    const formSnapshot = { ...rawFormData, ...parsedRaw } as RealEstateContractFormData;
    const isVisible =
      typeof (config as any).showIf === 'function'
        ? !!(config as any).showIf(formSnapshot)
        : true;

    if (!isVisible) continue;

    if (config.required && isEmptyValue(parsedValue)) {
      errors[field] = `${config.label} is required.`;
      continue;
    }

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

  // Required pairs
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

  // Optional pairs (if any defined in schema)
  // e.g. validateInlinePair(formSnapshot, errors, 'depositAmount', 'depositUnit', 'Deposit', false, schema);

  return {
    parsed: parsedRaw as RealEstateContractFormData,
    errors,
  };
}
