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

    if (config.required && isEmptyValue(parsedValue)) {
      errors[field] = `${config.label} is required.`;
      console.log(`⚠️ [${String(field)}] missing required value`);
      continue;
    }

    if (config.validate) {
      const normalized = normalizeForValidation(parsedValue, config.type);
      const parsedFormData = parsedRaw as StartupAdvisoryFormData;

      const result = config.validate(normalized, parsedFormData);

      if (!result) {
        errors[field] = `${config.label} is invalid.`;
      }
    }
  }

  return {
    parsed: parsedRaw as StartupAdvisoryFormData,
    errors,
  };
}

