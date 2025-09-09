// src/utils/parseAndValidateStartupAdvisoryForm.ts

import type { StartupAdvisoryFormData } from '../types/StartupAdvisoryFormData';
import type { StartupAdvisoryFieldConfig } from '../types/StartupAdvisoryFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';

export type StartupAdvisoryValidationErrors = Partial<
  Record<keyof StartupAdvisoryFormData, string>
>;

export function parseAndValidateStartupAdvisoryForm(
  rawFormData: StartupAdvisoryFormData,
  schema: Record<string, StartupAdvisoryFieldConfig>
): { parsed: StartupAdvisoryFormData; errors: StartupAdvisoryValidationErrors } {
  const errors: StartupAdvisoryValidationErrors = {};
  const parsedRaw: Partial<
    Record<
      keyof StartupAdvisoryFormData,
      StartupAdvisoryFormData[keyof StartupAdvisoryFormData]
    >
  > = {};

  // --- Generic per-field parsing + schema-driven validation ---
  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof StartupAdvisoryFormData;
    const rawValue = rawFormData[field];
    let parsedValue: unknown = rawValue;

    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
    }
    if (config.type === 'string' || config.type === 'date') {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    }

    parsedRaw[field] = parsedValue as StartupAdvisoryFormData[typeof field];

    // Skip validation if field is hidden
    const formSnapshot = { ...rawFormData, ...parsedRaw } as StartupAdvisoryFormData;
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
  const formSnapshot = { ...rawFormData, ...parsedRaw } as StartupAdvisoryFormData;

  function validateInlinePair(
    valueKey: keyof StartupAdvisoryFormData,
    unitKey: keyof StartupAdvisoryFormData,
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
        errors[`${String(valueKey)}__${String(unitKey)}` as keyof StartupAdvisoryFormData] =
          `Please enter both a value and a unit for ${label}`;
        console.warn(`⚠️ Missing required inline pair: ${label}`);
      }
    }
  }

  function validateInlinePairPercentOnly(
    percentKey: keyof StartupAdvisoryFormData,
    sharesKey: keyof StartupAdvisoryFormData,
    label: string
  ) {
    const percentCfg = schema[percentKey];
    const sharesCfg = schema[sharesKey];

    const percentVisible =
      typeof (percentCfg as any).showIf === 'function'
        ? !!(percentCfg as any).showIf(formSnapshot)
        : true;
    const sharesVisible =
      typeof (sharesCfg as any).showIf === 'function'
        ? !!(sharesCfg as any).showIf(formSnapshot)
        : true;

    if (percentVisible && sharesVisible) {
      const percentVal = formSnapshot[percentKey];
      const num = Number(percentVal);
      if (!Number.isFinite(num) || num <= 0) {
        errors[`${String(percentKey)}__${String(sharesKey)}` as keyof StartupAdvisoryFormData] =
          `Please enter a valid percentage for ${label}`;
        console.warn(`⚠️ Missing/invalid percent for ${label}`);
      }
    }
  }

  // --- Always-required value+unit pairs ---
  validateInlinePair('agreementDurationValue', 'agreementDurationUnit', 'Agreement Duration');
  validateInlinePair('timeCommitmentValue', 'timeCommitmentUnit', 'Time Commitment');

  // --- Conditionally-required value+unit pairs ---
  validateInlinePair('cliffPeriodValue', 'cliffPeriodUnit', 'Cliff Period');
  validateInlinePair('totalVestingPeriodValue', 'totalVestingPeriodUnit', 'Total Vesting Period');

  // --- Split equity grant percent-only pairs ---
  validateInlinePairPercentOnly('initialEquityPercentage', 'initialEquityShares', 'Initial Grant');
  validateInlinePairPercentOnly('futureEquityPercentage', 'futureEquityShares', 'Future Grant');

  // Truly optional pairs → do NOT call validateInlinePair()

  return {
    parsed: parsedRaw as StartupAdvisoryFormData,
    errors,
  };
}