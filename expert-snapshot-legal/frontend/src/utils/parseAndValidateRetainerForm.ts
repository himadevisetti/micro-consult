import { standardRetainerSchema } from '../schemas/standardRetainerSchema.js';
import { defaultRetainerFormData } from '../types/RetainerFormData.js';
import type { RetainerFormData } from '../types/RetainerFormData.js';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils.js';
import { normalizeFormDates } from '../utils/normalizeFormDates.js';

export type ValidationErrors = Partial<Record<keyof RetainerFormData, string>>;

export function parseAndValidateRetainerForm(
  rawFormData: Record<string, string>
): { parsed: RetainerFormData; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const normalizedFormData = normalizeFormDates(rawFormData, ['startDate', 'endDate']);
  const parsedRaw: Partial<Record<keyof RetainerFormData, RetainerFormData[keyof RetainerFormData]>> = {};

  for (const [key, config] of Object.entries(standardRetainerSchema)) {
    const field = key as keyof RetainerFormData;

    // 🔎 Log field access explicitly
    const rawValue = normalizedFormData[field] ?? rawFormData[field];
    console.log(`🧪 [${field}] rawValue =`, rawValue);

    let parsedValue: unknown = rawValue;

    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
      console.log(`🔢 [${field}] parsed number:`, parsedValue);
    }

    if (config.type === 'string' || config.type === 'date') {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
      console.log(`🔤 [${field}] normalized string:`, parsedValue);
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

      console.log(`🔍 [${field}] validate input: raw="${rawValue}", normalized="${normalized}"`);
      const result = config.validate(normalized, parsedFormData);

      console.log(`✅ [${field}] validation result:`, result);

      if (!result) {
        errors[field] = `${config.label} is invalid.`;
      }
    }
  }

  const parsedFormData = parsedRaw as RetainerFormData;

  if (!errors.startDate && !errors.endDate) {
    const start = normalizeForValidation(parsedFormData.startDate, 'date');
    const end = normalizeForValidation(parsedFormData.endDate, 'date');
    if (start && end && end <= start) {
      errors.endDate = 'End date must be after start date.';
    }
  }

  return {
    parsed: parsedFormData,
    errors,
  };
}
