// src/utils/parseAndValidateEmploymentAgreementForm.ts

import type { EmploymentAgreementFormData } from '../types/EmploymentAgreementFormData';
import type { EmploymentAgreementFieldConfig } from '../types/EmploymentAgreementFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';

export type EmploymentAgreementValidationErrors = Partial<
  Record<keyof EmploymentAgreementFormData, string>
>;

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
    if (config.type === 'string' || config.type === 'date') {
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
    label: string
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
      if (isEmptyValue(value) || isEmptyValue(unit)) {
        errors[`${String(valueKey)}__${String(unitKey)}` as keyof EmploymentAgreementFormData] =
          `Please enter both a value and a unit for ${label}`;
        console.warn(`⚠️ Missing required inline pair: ${label}`);
      }
    }
  }

  // --- Always/conditionally required value+unit pairs in Employment Agreement ---
  validateInlinePair('contractDurationValue', 'contractDurationUnit', 'Contract Duration');
  validateInlinePair('nonCompeteDurationValue', 'nonCompeteDurationUnit', 'Non-Compete Duration');
  validateInlinePair('bonusAmount', 'bonusUnit', 'Bonus');
  validateInlinePair('noticePeriodEmployer', 'noticePeriodEmployerUnit', 'Employer Notice Period');
  validateInlinePair('noticePeriodEmployee', 'noticePeriodEmployeeUnit', 'Employee Notice Period');
  validateInlinePair('probationPeriod', 'probationPeriodUnit', 'Probation Period');

  // No percent-only pairs in this schema, so we skip validateInlinePairPercentOnly

  return {
    parsed: parsedRaw as EmploymentAgreementFormData,
    errors,
  };
}

