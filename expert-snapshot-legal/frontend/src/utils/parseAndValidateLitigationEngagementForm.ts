// src/utils/parseAndValidateLitigationEngagementForm.ts

import type { LitigationEngagementFormData } from '../types/LitigationEngagementFormData';
import type { LitigationEngagementFieldConfig } from '../types/LitigationEngagementFieldConfig';
import { normalizeForValidation, isEmptyValue } from './formSchemaUtils';

export type LitigationEngagementValidationErrors = Partial<Record<keyof LitigationEngagementFormData, string>>;

export function parseAndValidateLitigationEngagementForm(
  rawFormData: LitigationEngagementFormData,
  schema: Record<string, LitigationEngagementFieldConfig>
): { parsed: LitigationEngagementFormData; errors: LitigationEngagementValidationErrors } {
  const errors: LitigationEngagementValidationErrors = {};
  const parsedRaw: Partial<
    Record<
      keyof LitigationEngagementFormData,
      LitigationEngagementFormData[keyof LitigationEngagementFormData]
    >
  > = {};

  // --- Per-field parsing and validation ---
  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof LitigationEngagementFormData;
    const rawValue = rawFormData[field];

    let parsedValue: unknown = rawValue;

    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
    }

    if (
      config.type === 'text' ||
      config.type === 'textarea' ||
      config.type === 'date' ||
      config.type === 'dropdown'
    ) {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    }

    if (config.type === 'checkbox') {
      parsedValue = rawValue === true || rawValue === 'true';
    }

    parsedRaw[field] = parsedValue as LitigationEngagementFormData[typeof field];

    if (config.required && isEmptyValue(parsedValue)) {
      errors[field] = `${config.label} is required.`;
      console.log(`⚠️ [${String(field)}] missing required value`);
      continue;
    }

    if (config.validate) {
      const normalized = normalizeForValidation(parsedValue, config.type);
      const parsedFormData = parsedRaw as LitigationEngagementFormData;

      const result = config.validate(normalized, parsedFormData);

      if (!result) {
        errors[field] = `${config.label} is invalid.`;
      }
    }
  }

  // --- Cross-field business rules ---
  const parsedFormData = parsedRaw as LitigationEngagementFormData;

  // Filed Date presence rule: if any case/court fields are present, filedDate must be provided and valid
  if (
    !isEmptyValue(parsedFormData.caseCaption) ||
    !isEmptyValue(parsedFormData.caseNumber) ||
    !isEmptyValue(parsedFormData.courtName) ||
    !isEmptyValue(parsedFormData.courtAddress) ||
    !isEmptyValue(parsedFormData.countyName)
  ) {
    if (isEmptyValue(parsedFormData.filedDate)) {
      errors.filedDate = "Filed Date is required once case details are provided.";
    } else {
      const filed = new Date(parsedFormData.filedDate as string);
      if (isNaN(filed.getTime())) {
        errors.filedDate = "Filed Date must be a valid calendar date in YYYY-MM-DD format.";
      }
    }
  }

  // Filed Date ordering rule: if filedDate is present, must be valid and <= executionDate
  let isFiledValid = false;
  if (!isEmptyValue(parsedFormData.filedDate)) {
    const filed = new Date(parsedFormData.filedDate as string);
    isFiledValid = !isNaN(filed.getTime());

    if (!isFiledValid) {
      errors.filedDate = "Filed Date must be a valid calendar date in YYYY-MM-DD format.";
    } else if (!isEmptyValue(parsedFormData.executionDate)) {
      const execution = new Date(parsedFormData.executionDate as string);
      if (filed > execution) {
        errors.filedDate = "Filed Date must be on or before Execution Date.";
      }
    }
  }

  // Post-filing rules: only run if filedDate is valid
  if (isFiledValid) {
    if (isEmptyValue(parsedFormData.caseCaption)) {
      errors.caseCaption = "Case Caption is required once case is filed.";
    }
    if (isEmptyValue(parsedFormData.caseNumber)) {
      errors.caseNumber = "Case Number is required once case is filed.";
    }
    if (isEmptyValue(parsedFormData.courtName)) {
      errors.courtName = "Court Name is required once case is filed.";
    }
    if (isEmptyValue(parsedFormData.courtAddress)) {
      errors.courtAddress = "Court Address is required once case is filed.";
    }
    if (isEmptyValue(parsedFormData.countyName)) {
      errors.countyName = "County Name is required once case is filed.";
    }
  }

  // Expiration Date rule: if present, must be >= executionDate
  if (!isEmptyValue(parsedFormData.expirationDate) && !isEmptyValue(parsedFormData.executionDate)) {
    const expiration = new Date(parsedFormData.expirationDate as string);
    const execution = new Date(parsedFormData.executionDate as string);

    if (expiration < execution) {
      errors.expirationDate = "Expiration Date must be on or after Execution Date.";
    }
  }

  return {
    parsed: parsedFormData,
    errors,
  };
}
