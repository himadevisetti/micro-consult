// src/utils/parseAndValidateFamilyLawAgreementForm.ts

import type { FamilyLawAgreementFormData, VisitationScheduleEntry } from '../types/FamilyLawAgreementFormData';
import type { FamilyLawAgreementFieldConfig } from '../types/FamilyLawAgreementFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';
import { validateInlinePair } from '@/utils/validateInlinePair';

export type FamilyLawAgreementValidationErrors = Partial<
  Record<keyof FamilyLawAgreementFormData, string>
>;

export function parseAndValidateFamilyLawAgreementForm(
  rawFormData: FamilyLawAgreementFormData,
  schema: Record<string, FamilyLawAgreementFieldConfig>
): { parsed: FamilyLawAgreementFormData; errors: FamilyLawAgreementValidationErrors } {
  const errors: FamilyLawAgreementValidationErrors = {};
  const parsedRaw: Partial<
    Record<
      keyof FamilyLawAgreementFormData,
      FamilyLawAgreementFormData[keyof FamilyLawAgreementFormData]
    >
  > = {};

  // --- Generic per-field parsing + schema-driven validation ---
  for (const [key, config] of Object.entries(schema)) {
    const field = key as keyof FamilyLawAgreementFormData;
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

    parsedRaw[field] = parsedValue as FamilyLawAgreementFormData[typeof field];

    // Skip validation if field is hidden
    const formSnapshot = { ...rawFormData, ...parsedRaw } as FamilyLawAgreementFormData;
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
  const formSnapshot = { ...rawFormData, ...parsedRaw } as FamilyLawAgreementFormData;

  // Child Support: Amount + Frequency
  validateInlinePair(
    formSnapshot,
    errors,
    'childSupportAmount' as keyof FamilyLawAgreementFormData,
    'childSupportPaymentFrequency' as keyof FamilyLawAgreementFormData,
    'Child Support Obligation',
    false,
    schema
  );

  // Spousal Support: Amount + Duration
  validateInlinePair(
    formSnapshot,
    errors,
    'spousalSupportAmount' as keyof FamilyLawAgreementFormData,
    'spousalSupportDurationMonths' as keyof FamilyLawAgreementFormData,
    'Spousal Support Obligation',
    false,
    schema
  );

  // --- Role-specific validations ---
  if (formSnapshot.agreementType === 'Divorce') {
    if (isEmptyValue(formSnapshot.petitionerName)) {
      errors.petitionerName = 'Petitioner Name is required.';
    }
    if (isEmptyValue(formSnapshot.respondentName)) {
      errors.respondentName = 'Respondent Name is required.';
    }
    if (isEmptyValue(formSnapshot.petitionerSignatoryName)) {
      errors.petitionerSignatoryName = 'Petitioner Signatory Name is required.';
    }
    if (isEmptyValue(formSnapshot.respondentSignatoryName)) {
      errors.respondentSignatoryName = 'Respondent Signatory Name is required.';
    }
  }

  if (formSnapshot.agreementType === 'Custody' || formSnapshot.agreementType === 'ChildSupport') {
    if (isEmptyValue(formSnapshot.motherName)) {
      errors.motherName = 'Mother Name is required.';
    }
    if (isEmptyValue(formSnapshot.fatherName)) {
      errors.fatherName = 'Father Name is required.';
    }
    if (isEmptyValue(formSnapshot.motherSignatoryName)) {
      errors.motherSignatoryName = 'Mother Signatory Name is required.';
    }
    if (isEmptyValue(formSnapshot.fatherSignatoryName)) {
      errors.fatherSignatoryName = 'Father Signatory Name is required.';
    }
  }

  if (formSnapshot.agreementType === 'SpousalSupport' || formSnapshot.agreementType === 'PropertySettlement') {
    if (isEmptyValue(formSnapshot.spouse1Name)) {
      errors.spouse1Name = 'Spouse 1 Name is required.';
    }
    if (isEmptyValue(formSnapshot.spouse2Name)) {
      errors.spouse2Name = 'Spouse 2 Name is required.';
    }
    if (isEmptyValue(formSnapshot.spouse1SignatoryName)) {
      errors.spouse1SignatoryName = 'Spouse 1 Signatory Name is required.';
    }
    if (isEmptyValue(formSnapshot.spouse2SignatoryName)) {
      errors.spouse2SignatoryName = 'Spouse 2 Signatory Name is required.';
    }
  }

  // --- Visitation Schedule (Days + Time range) validation ---
  {
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
        if (!hasAny) return; // skip empty rows

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
          schema.visitationScheduleEntries?.pair?.find(f => f.type === 'multiselect')?.key || 'days';

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
