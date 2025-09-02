import type { IPRightsLicensingFormData } from '../types/IPRightsLicensingFormData';
import type { IPRetainerFieldConfig } from '../types/IPRetainerFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';

export type IPValidationErrors = Partial<Record<keyof IPRightsLicensingFormData, string>>;

export function parseAndValidateIPForm(
  rawFormData: IPRightsLicensingFormData,
  schema: Record<string, IPRetainerFieldConfig>
): { parsed: IPRightsLicensingFormData; errors: IPValidationErrors } {
  const errors: IPValidationErrors = {};
  const parsedRaw: Partial<Record<keyof IPRightsLicensingFormData, IPRightsLicensingFormData[keyof IPRightsLicensingFormData]>> = {};

  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof IPRightsLicensingFormData;
    const rawValue = rawFormData[field];

    let parsedValue: unknown = rawValue;

    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
    }

    if (config.type === 'string' || config.type === 'date') {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    }

    parsedRaw[field] = parsedValue as IPRightsLicensingFormData[typeof field];

    if (config.required && isEmptyValue(parsedValue)) {
      errors[field] = `${config.label} is required.`;
      console.log(`⚠️ [${field}] missing required value`);
      continue;
    }

    if (config.validate) {
      const normalized = normalizeForValidation(parsedValue, config.type);
      const parsedFormData = parsedRaw as IPRightsLicensingFormData;

      const result = config.validate(normalized, parsedFormData);

      if (!result) {
        errors[field] = `${config.label} is invalid.`;
      }
    }
  }

  return {
    parsed: parsedRaw as IPRightsLicensingFormData,
    errors,
  };
}

