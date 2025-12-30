// src/utils/parseAndValidateFamilyLawAgreementForm.ts

import type { FamilyLawAgreementFormData } from '../types/FamilyLawAgreementFormData';
import type { FamilyLawAgreementFieldConfig } from '../types/FamilyLawAgreementFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';
import { validateInlinePair } from '@/utils/validateInlinePair';
import { validateChildren } from './validateChildren';
import { validateVisitationSchedule } from './validateVisitationSchedule';
import { validateContactFields } from './validateContactField';

export type FamilyLawAgreementValidationErrors = Partial<
  Record<keyof FamilyLawAgreementFormData, string>
>;

export function parseAndValidateFamilyLawAgreementForm(
  rawFormData: FamilyLawAgreementFormData,
  schema: Record<string, FamilyLawAgreementFieldConfig>
): { parsed: FamilyLawAgreementFormData; errors: FamilyLawAgreementValidationErrors } {
  const errors: FamilyLawAgreementValidationErrors = {};
  const parsedRaw: Partial<Record<keyof FamilyLawAgreementFormData, any>> = {};

  // --- Generic per-field parsing + schema-driven validation ---
  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof FamilyLawAgreementFormData;
    const rawValue = rawFormData[field];
    let parsedValue: unknown = rawValue;

    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
    }
    if (config.type === 'text' || config.type === 'textarea' || config.type === 'date') {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    }

    parsedRaw[field] = parsedValue as FamilyLawAgreementFormData[typeof field];

    const formSnapshot = { ...rawFormData, ...parsedRaw } as FamilyLawAgreementFormData;
    const isVisible =
      typeof config.showIf === 'function' ? !!config.showIf(formSnapshot) : true;
    if (!isVisible) continue;

    const isRequired =
      config.required === true ||
      (typeof (config as any).requiredIf === 'function' &&
        (config as any).requiredIf(formSnapshot));

    if (isRequired && isEmptyValue(parsedValue)) {
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

  const formSnapshot = { ...rawFormData, ...parsedRaw } as FamilyLawAgreementFormData;

  // --- Inline pair validations ---
  if (schema.childSupportAmount || schema.childSupportPaymentFrequency) {
    validateInlinePair(
      formSnapshot,
      errors,
      'childSupportAmount',
      'childSupportPaymentFrequency',
      'Child Support Obligation',
      false,
      schema
    );
  }

  if (schema.spousalSupportAmount || schema.spousalSupportDurationMonths) {
    validateInlinePair(
      formSnapshot,
      errors,
      'spousalSupportAmount',
      'spousalSupportDurationMonths',
      'Spousal Support Obligation',
      false,
      schema
    );
  }

  // --- Children (custom helper) ---
  if (schema.children) {
    parsedRaw.children = validateChildren(formSnapshot, errors, schema.children);
  }

  // --- Visitation (custom helper) ---
  if (schema.visitationScheduleEntries) {
    parsedRaw.visitationScheduleEntries = validateVisitationSchedule(
      formSnapshot,
      errors,
      schema.visitationScheduleEntries
    );
  }

  // --- Contact fields (helper) ---
  validateContactFields(formSnapshot, errors, schema);

  return {
    parsed: parsedRaw as FamilyLawAgreementFormData,
    errors,
  };
}
