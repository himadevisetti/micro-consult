// src/utils/parseAndValidateFamilyLawAgreementForm.ts

import type { FamilyLawAgreementFormData, VisitationScheduleEntry } from '../types/FamilyLawAgreementFormData';
import type { FamilyLawAgreementFieldConfig } from '../types/FamilyLawAgreementFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';
import { validateInlinePair } from '@/utils/validateInlinePair';

export type FamilyLawAgreementValidationErrors = Partial<
  Record<keyof FamilyLawAgreementFormData, string>
>;

// ✅ helper for contact validation
function validateContact(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
  return emailRegex.test(value) || phoneRegex.test(value);
}

export function parseAndValidateFamilyLawAgreementForm(
  rawFormData: FamilyLawAgreementFormData,
  schema: Record<string, FamilyLawAgreementFieldConfig>
): { parsed: FamilyLawAgreementFormData; errors: FamilyLawAgreementValidationErrors } {
  const errors: FamilyLawAgreementValidationErrors = {};
  const parsedRaw: Partial<Record<keyof FamilyLawAgreementFormData, any>> = {};

  // --- Instrumentation: log schema keys received ---
  console.log("Validator received schema keys:", Object.keys(schema));

  // --- Generic per-field parsing + schema-driven validation ---
  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof FamilyLawAgreementFormData;
    const rawValue = rawFormData[field];
    let parsedValue: unknown = rawValue;

    // normalize values
    if (config.type === 'number') {
      parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
    }
    if (config.type === 'text' || config.type === 'textarea' || config.type === 'date') {
      parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    }

    parsedRaw[field] = parsedValue as FamilyLawAgreementFormData[typeof field];

    // Skip validation if field is hidden
    const formSnapshot = { ...rawFormData, ...parsedRaw } as FamilyLawAgreementFormData;
    const isVisible =
      typeof (config as any).showIf === 'function'
        ? !!(config as any).showIf(formSnapshot)
        : true;

    if (!isVisible) continue;

    // --- Instrumentation: log each field being validated ---
    console.log("Validating field:", field, "required:", config.required, "value:", parsedValue);

    // ✅ required check
    if (config.required && isEmptyValue(parsedValue)) {
      errors[field] = `${config.label} is required.`;
      console.warn(`⚠️ Missing required: ${String(field)}`);
      continue;
    }

    // ✅ contact validation
    if (
      (field === 'petitionerContact' ||
        field === 'respondentContact' ||
        field === 'motherContact' ||
        field === 'fatherContact' ||
        field === 'spouse1Contact' ||
        field === 'spouse2Contact') &&
      !isEmptyValue(parsedValue) &&
      !validateContact(parsedValue as string)
    ) {
      errors[field] = `${config.label} must be a valid phone number or email.`;
      console.warn(`⚠️ Invalid contact: ${String(field)}`);
    }

    // ✅ custom validators
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
  const formSnapshot = { ...rawFormData, ...parsedRaw } as FamilyLawAgreementFormData;

  // ✅ Only run inline pair checks if those fields exist in the current step schema
  if (schema.childSupportAmount || schema.childSupportPaymentFrequency) {
    console.log("Running inline pair validation for Child Support");
    validateInlinePair(
      formSnapshot,
      errors,
      'childSupportAmount',
      'childSupportPaymentFrequency',
      'Child Support Obligation',
      false,
      schema // pass stepSchema, not full master schema
    );
  }

  if (schema.spousalSupportAmount || schema.spousalSupportDurationMonths) {
    console.log("Running inline pair validation for Spousal Support");
    validateInlinePair(
      formSnapshot,
      errors,
      'spousalSupportAmount',
      'spousalSupportDurationMonths',
      'Spousal Support Obligation',
      false,
      schema // pass stepSchema
    );
  }

  // --- Visitation Schedule validation ---
  if (schema.visitationScheduleEntries) {
    console.log("Running visitation schedule validation");
    const vsCfg = schema.visitationScheduleEntries as any;
    const vsVisible =
      typeof vsCfg?.showIf === 'function' ? !!vsCfg.showIf(formSnapshot) : true;

    if (vsVisible) {
      const schedule = Array.isArray((formSnapshot as any).visitationScheduleEntries)
        ? (formSnapshot as any).visitationScheduleEntries
        : [];

      let hasPerRowErrors = false;
      let validRowCount = 0;

      schedule.forEach((row: any, idx: number) => {
        const days: string[] = Array.isArray(row?.days) ? row.days.filter(Boolean) : [];
        const startStr: string = row?.hours?.start || '';
        const endStr: string = row?.hours?.end || '';

        const hasAny = days.length > 0 || !!startStr || !!endStr;
        if (!hasAny) return;

        if (days.length === 0) {
          (errors as any)[`visitationSchedule_row_${idx}_days`] =
            `Row ${idx + 1}: Please select at least one day.`;
          hasPerRowErrors = true;
        }

        if (days.length > 0) {
          if (!startStr || !endStr) {
            (errors as any)[`visitationSchedule_row_${idx}_start`] =
              `Row ${idx + 1}: Please select both start and end times for the chosen days.`;
            hasPerRowErrors = true;
            return;
          }
        }

        if (startStr && endStr) {
          const [sh, sm] = startStr.split(':').map(Number);
          const [eh, em] = endStr.split(':').map(Number);
          const startMins = sh * 60 + sm;
          const endMins = eh * 60 + em;
          if (!(startMins < endMins)) {
            (errors as any)[`visitationSchedule_row_${idx}_end`] =
              `Row ${idx + 1}: End time must be after start time.`;
            hasPerRowErrors = true;
            return;
          }
        }

        validRowCount++;
      });

      // --- Empty-row pruning ---
      let prunedSchedule: VisitationScheduleEntry[] = [];
      if (Array.isArray(parsedRaw.visitationScheduleEntries)) {
        prunedSchedule = parsedRaw.visitationScheduleEntries.filter((row: any) => {
          const hasDays = Array.isArray(row?.days) && row.days.filter(Boolean).length > 0;
          const hasTimes = !!row?.hours?.start || !!row?.hours?.end;
          return hasDays || hasTimes;
        }) as VisitationScheduleEntry[];
      } else {
        prunedSchedule = [];
      }
      parsedRaw.visitationScheduleEntries = prunedSchedule;

      // --- Requiredness check ---
      if (formSnapshot.agreementType === 'Custody' && validRowCount === 0 && !hasPerRowErrors) {
        const daysFieldKey =
          schema.visitationScheduleEntries?.pair?.find((f: any) => f.type === 'multiselect')?.key || 'days';

        const firstRowDaysKey = `visitationSchedule_row_0_${daysFieldKey}`;
        const message = `${vsCfg?.label || 'Visitation Schedule'} is required: add at least one row with days and a start–end time.`;

        (errors as any).visitationScheduleEntries = message;
        (errors as any)[firstRowDaysKey] = message;
      }
    }
  }

  return {
    parsed: parsedRaw as FamilyLawAgreementFormData,
    errors,
  };
}
