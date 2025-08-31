import type { RetainerFormData } from '../types/RetainerFormData.js';
import type { RetainerFieldConfig } from '../types/RetainerFieldConfig.js';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils.js';

export type ValidationErrors = Partial<Record<keyof RetainerFormData, string>>;

export function parseAndValidateRetainerForm(
  rawFormData: RetainerFormData,
  schema: Record<string, RetainerFieldConfig>
): { parsed: RetainerFormData; errors: ValidationErrors } {
  const errors: ValidationErrors = {};
  const parsedRaw: Partial<Record<keyof RetainerFormData, RetainerFormData[keyof RetainerFormData]>> = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof RetainerFormData;
    const rawValue = rawFormData[field];

    let parsedValue: unknown = rawValue;

    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
    }

    if (config.type === 'string' || config.type === 'date') {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    }

    parsedRaw[field] = parsedValue as RetainerFormData[typeof field];

    if (config.required && isEmptyValue(parsedValue)) {
      errors[field] =
        field === 'startDate'
          ? 'Start date must be selected.'
          : field === 'endDate'
            ? 'End date must be selected.'
            : `${config.label} is required.`;
      console.log(`⚠️ [${field}] missing required value`);
      continue;
    }

    if (config.validate) {
      const normalized = normalizeForValidation(parsedValue, config.type);
      const parsedFormData = parsedRaw as RetainerFormData;

      const result = config.validate(normalized, parsedFormData);

      if (!result) {
        errors[field] = `${config.label} is invalid.`;
      }
    }
  }

  return {
    parsed: parsedRaw as RetainerFormData,
    errors,
  };
}
