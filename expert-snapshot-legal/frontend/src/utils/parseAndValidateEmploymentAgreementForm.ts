// src/utils/parseAndValidateEmploymentAgreementForm.ts

import type { EmploymentAgreementFormData } from '../types/EmploymentAgreementFormData';
import type { EmploymentAgreementFieldConfig } from '../types/EmploymentAgreementFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';

export type EmploymentAgreementValidationErrors = Partial<
  Record<keyof EmploymentAgreementFormData, string>
>;

// Helper: detect if a unit value is the default for its field
function isDefaultUnitValue(
  unitKey: keyof EmploymentAgreementFormData,
  unit: unknown
): boolean {
  if (typeof unit !== 'string') return false;
  const u = unit.trim().toLowerCase();

  const defaultUnits: Record<string, string[]> = {
    bonusUnit: ['none', '%', 'usd'],
    noticePeriodEmployerUnit: ['weeks', 'days'],
    noticePeriodEmployeeUnit: ['weeks', 'days'],
    probationPeriodUnit: ['months', 'days'],
  };

  return defaultUnits[unitKey as string]?.includes(u) ?? false;
}

export function parseAndValidateEmploymentAgreementForm(
  rawFormData: EmploymentAgreementFormData,
  schema: Record<string, EmploymentAgreementFieldConfig>
): { parsed: EmploymentAgreementFormData; errors: EmploymentAgreementValidationErrors } {
  const errors: EmploymentAgreementValidationErrors = {};
  const parsedRaw: Partial<
    Record<
      keyof EmploymentAgreementFormData,
      EmploymentAgreementFormData[keyof EmploymentAgreementFormData]
    >
  > = {};

  // --- Generic per-field parsing + schema-driven validation ---
  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof EmploymentAgreementFormData;
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

    parsedRaw[field] = parsedValue as EmploymentAgreementFormData[typeof field];

    // Skip validation if field is hidden
    const formSnapshot = { ...rawFormData, ...parsedRaw } as EmploymentAgreementFormData;
    const isVisible =
      typeof (config as any).showIf === 'function'
        ? !!(config as any).showIf(formSnapshot)
        : true;

    if (!isVisible) {
      continue;
    }

    if (config.required && isEmptyValue(parsedValue)) {
      errors[field] = `${config.label} is required.`;
      console.warn(`⚠️ Missing required: ${String(field)}`);
      continue;
    }

    if (config.validate) {
      const normalized = normalizeForValidation(parsedValue, config.type);
      const result = config.validate(normalized, formSnapshot);
      if (!result) {
        errors[field] = `${config.label} is invalid.`;
        console.warn(`⚠️ Invalid: ${String(field)}`);
      }
    }
  }

  // --- Combined inline pair validation helpers ---
  const formSnapshot = { ...rawFormData, ...parsedRaw } as EmploymentAgreementFormData;

  function validateInlinePair(
    valueKey: keyof EmploymentAgreementFormData,
    unitKey: keyof EmploymentAgreementFormData,
    label: string,
    required: boolean,
    allowZero = false // ✅ new optional flag
  ) {
    const valueCfg = schema[valueKey];
    const unitCfg = schema[unitKey];

    const valueVisible =
      typeof (valueCfg as any).showIf === 'function'
        ? !!(valueCfg as any).showIf(formSnapshot)
        : true;
    const unitVisible =
      typeof (unitCfg as any).showIf === 'function'
        ? !!(unitCfg as any).showIf(formSnapshot)
        : true;

    if (valueVisible && unitVisible) {
      const value = formSnapshot[valueKey];
      const unit = formSnapshot[unitKey];

      const numericValue =
        typeof value === 'string' && value.trim() !== ''
          ? Number(value)
          : typeof value === 'number'
            ? value
            : undefined;

      // ✅ Only allow 0 if allowZero is true
      const hasValidValue =
        numericValue !== undefined &&
        !Number.isNaN(numericValue) &&
        (allowZero ? numericValue >= 0 : numericValue > 0);

      const unitLooksDefault = isDefaultUnitValue(unitKey, unit);
      const hasUnit =
        !isEmptyValue(unit) &&
        !(!required && numericValue === undefined && unitLooksDefault);

      const combinedKey = `${String(valueKey)}__${String(unitKey)}` as keyof EmploymentAgreementFormData;

      if (required) {
        if (!hasValidValue || !hasUnit) {
          errors[combinedKey] = `${label} must include a value${allowZero ? ' (0 or greater)' : ' greater than 0'} and a unit.`;
        }
      } else {
        if ((hasValidValue && !hasUnit) || (!hasValidValue && hasUnit)) {
          errors[combinedKey] = `Please enter both a value and a unit for ${label}`;
        }
      }
    }
  }

  // Required pairs
  validateInlinePair('baseSalary', 'payFrequency', 'Base Salary', true, false);
  validateInlinePair('contractDurationValue', 'contractDurationUnit', 'Contract Duration', true, false);
  validateInlinePair('nonCompeteDurationValue', 'nonCompeteDurationUnit', 'Non-Compete Duration', true, false);
  validateInlinePair('noticePeriodEmployer', 'noticePeriodEmployerUnit', 'Employer Notice Period', true, false);
  validateInlinePair('noticePeriodEmployee', 'noticePeriodEmployeeUnit', 'Employee Notice Period', true, false);

  // Optional pairs
  validateInlinePair('bonusAmount', 'bonusUnit', 'Bonus', false, false);

  // Probation Period — allow zero
  validateInlinePair(
    'probationPeriod',
    'probationPeriodUnit',
    'Probation Period',
    formSnapshot.contractType === 'Probationary',
    true // allow zero
  );

  return {
    parsed: parsedRaw as EmploymentAgreementFormData,
    errors,
  };
}
