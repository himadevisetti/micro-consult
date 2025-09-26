// src/utils/parseAndValidateEmploymentAgreementForm.ts

import type { EmploymentAgreementFormData, WorkScheduleEntry } from '../types/EmploymentAgreementFormData';
import type { EmploymentAgreementFieldConfig } from '../types/EmploymentAgreementFieldConfig';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils';
import { validateInlinePair } from '@/utils/validateInlinePair';

export type EmploymentAgreementValidationErrors = Partial<
  Record<keyof EmploymentAgreementFormData, string>
>;

// Helper: detect if a unit value is the default for its field
function isDefaultUnitValue(
  unitKey: keyof EmploymentAgreementFormData,
  unit: unknown
): boolean {
  if (typeof unit !== 'string') return false;
  const u = unit.trim().toLowerCase();

  const defaultUnits: Record<string, string[]> = {
    bonusUnit: ['none', '%', 'usd'],
    noticePeriodEmployerUnit: ['weeks', 'days'],
    noticePeriodEmployeeUnit: ['weeks', 'days'],
    probationPeriodUnit: ['months', 'days'],
  };

  return defaultUnits[unitKey as string]?.includes(u) ?? false;
}

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
    if (
      config.type === 'text' ||
      config.type === 'textarea' ||
      config.type === 'date'
    ) {
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

  // --- Required pairs ---

  validateInlinePair(
    formSnapshot,
    errors,
    'baseSalary',
    'payFrequency',
    'Base Salary',
    false,   // allowZero
    schema   // schema drives visibility + requiredness
  );

  validateInlinePair(
    formSnapshot,
    errors,
    'contractDurationValue',
    'contractDurationUnit',
    'Contract Duration',
    false,   // allowZero
    schema
  );

  validateInlinePair(
    formSnapshot,
    errors,
    'nonCompeteDurationValue',
    'nonCompeteDurationUnit',
    'Non-Compete Duration',
    false,   // allowZero
    schema
  );

  validateInlinePair(
    formSnapshot,
    errors,
    'noticePeriodEmployer',
    'noticePeriodEmployerUnit',
    'Employer Notice Period',
    false,   // allowZero
    schema
  );

  validateInlinePair(
    formSnapshot,
    errors,
    'noticePeriodEmployee',
    'noticePeriodEmployeeUnit',
    'Employee Notice Period',
    false,   // allowZero
    schema
  );

  // --- Optional pairs ---

  validateInlinePair(
    formSnapshot,
    errors,
    'bonusAmount',
    'bonusUnit',
    'Bonus',
    false,   // allowZero
    schema   // mark pairOptional: true in schema if truly optional
  );

  // --- Probation Period (allow zero) ---

  validateInlinePair(
    formSnapshot,
    errors,
    'probationPeriod',
    'probationPeriodUnit',
    'Probation Period',
    true,    // allowZero
    schema
  );

  // --- Hourly Rate + Hours per Week ---

  validateInlinePair(
    formSnapshot,
    errors,
    'hourlyRate',
    'hoursPerWeek',
    'Hourly Rate and Hours per Week',
    false,   // allowZero
    schema
  );

  if (formSnapshot.contractType === 'Part-Time') {
    const hours = parseInt((formSnapshot as any).hoursPerWeek || '', 10);
    if (isNaN(hours) || hours <= 0 || hours > 168) {
      // Use the field key so the error renders exactly below the Hours per Week field
      errors.hoursPerWeek = 'Please enter valid hours per week.';
    }
  }

  // --- Work Schedule (Days + Time range) validation ---
  {
    const wsCfg = schema.workSchedule as any;
    const wsVisible =
      typeof wsCfg?.showIf === 'function' ? !!wsCfg.showIf(formSnapshot) : true;

    // Required only for Hourly, Part-Time, Temporary
    const isScheduleRequired = (() => {
      const ct = formSnapshot.contractType;
      if (ct === 'Hourly' || ct === 'Part-Time' || ct === 'Temporary') return true;
      if (ct === 'Fixed-Term' && formSnapshot.compensationType === 'Hourly') return true;
      return false;
    })();

    if (wsVisible) {
      const schedule = Array.isArray((formSnapshot as any).workSchedule)
        ? (formSnapshot as any).workSchedule
        : [];

      let hasPerRowErrors = false;
      let validRowCount = 0;

      // --- Per-row validation ---
      schedule.forEach((row: any, idx: number) => {
        const days: string[] = Array.isArray(row?.days) ? row.days.filter(Boolean) : [];
        const startStr: string = row?.hours?.start || '';
        const endStr: string = row?.hours?.end || '';

        const hasAny = days.length > 0 || !!startStr || !!endStr;
        if (!hasAny) return; // skip completely empty rows

        // Days required for any active row
        if (days.length === 0) {
          (errors as any)[`workSchedule_row_${idx}_days`] =
            `Row ${idx + 1}: Please select at least one day.`;
          hasPerRowErrors = true;
        }

        // Require both start and end when either is present OR days are present
        if (days.length > 0) {
          if (!startStr && !endStr) {
            // Both empty → focus Start
            (errors as any)[`workSchedule_row_${idx}_start`] =
              `Row ${idx + 1}: Please select both start and end times for the chosen days.`;
            hasPerRowErrors = true;
            return;
          }
          if (!startStr) {
            // Only start missing → focus Start, but show combined message
            (errors as any)[`workSchedule_row_${idx}_start`] =
              `Row ${idx + 1}: Please select both start and end times for the chosen days.`;
            hasPerRowErrors = true;
            return;
          }
          if (!endStr) {
            // Only end missing → focus End, but show combined message
            (errors as any)[`workSchedule_row_${idx}_end`] =
              `Row ${idx + 1}: Please select both start and end times for the chosen days.`;
            hasPerRowErrors = true;
            return;
          }
        }

        // Backend guard: ensure end is after start
        if (startStr && endStr) {
          const [sh, sm] = startStr.split(':').map(Number);
          const [eh, em] = endStr.split(':').map(Number);
          const startMins = sh * 60 + sm;
          const endMins = eh * 60 + em;
          if (!(startMins < endMins)) {
            (errors as any)[`workSchedule_row_${idx}_end`] =
              `Row ${idx + 1}: End time must be after start time.`;
            hasPerRowErrors = true;
            return;
          }
        }

        // If we reach here, row is valid
        validRowCount++;
      });

      // --- Empty-row pruning ---
      let prunedSchedule: WorkScheduleEntry[] = [];
      if (Array.isArray(parsedRaw.workSchedule)) {
        const beforeCount = parsedRaw.workSchedule.length;
        prunedSchedule = parsedRaw.workSchedule.filter((row: any) => {
          const hasDays = Array.isArray(row?.days) && row.days.filter(Boolean).length > 0;
          const hasTimes = !!row?.hours?.start || !!row?.hours?.end;
          return hasDays || hasTimes;
        }) as WorkScheduleEntry[];
        const afterCount = prunedSchedule.length;
        if (beforeCount !== afterCount) {
          console.warn(`🧹 Pruned ${beforeCount - afterCount} empty workSchedule row(s)`);
        }
      } else {
        prunedSchedule = [];
      }
      parsedRaw.workSchedule = prunedSchedule;

      // --- Post-pruning requiredness check ---
      if (isScheduleRequired && validRowCount === 0 && !hasPerRowErrors) {
        // Resolve the Days field key from schema to avoid hardcoding
        const daysFieldKey =
          schema.workSchedule?.pair?.find(f => f.type === 'multiselect')?.key || 'days';

        const firstRowDaysKey = `workSchedule_row_0_${daysFieldKey}`;
        const message = `${wsCfg?.label || 'Work Schedule'} is required: add at least one row with days and a start–end time.`;

        // Field-level error for display under the block label
        (errors as any).workSchedule = message;

        // Row-level error so focus logic can match the actual input
        (errors as any)[firstRowDaysKey] = message;
      }
    }
  }

  return {
    parsed: parsedRaw as EmploymentAgreementFormData,
    errors,
  };
}
