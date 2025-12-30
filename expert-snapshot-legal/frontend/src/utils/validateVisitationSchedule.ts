// src/utils/validateVisitationSchedule.ts
import type { FamilyLawAgreementFormData, VisitationScheduleEntry } from '../types/FamilyLawAgreementFormData';
import type { FamilyLawAgreementValidationErrors } from './parseAndValidateFamilyLawAgreementForm';

export function validateVisitationSchedule(
  form: FamilyLawAgreementFormData,
  errors: FamilyLawAgreementValidationErrors,
  schemaEntry: any // VisitationScheduleFieldConfig
): VisitationScheduleEntry[] {
  const schedule: VisitationScheduleEntry[] = Array.isArray(form.visitationScheduleEntries)
    ? form.visitationScheduleEntries
    : [];

  let validRowCount = 0;
  let hasPerRowErrors = false;
  const pruned: VisitationScheduleEntry[] = [];

  schedule.forEach((row, idx) => {
    const days = Array.isArray(row?.days) ? row.days.filter(Boolean) : [];
    const startStr = row?.hours?.start || '';
    const endStr = row?.hours?.end || '';

    const hasAny = days.length > 0 || !!startStr || !!endStr;
    if (!hasAny) return;

    if (days.length === 0) {
      (errors as any)[`visitationSchedule_row_${idx}_days`] =
        `Row ${idx + 1}: Please select at least one day.`;
      hasPerRowErrors = true;
    }

    if (days.length > 0 && (!startStr || !endStr)) {
      (errors as any)[`visitationSchedule_row_${idx}_start`] =
        `Row ${idx + 1}: Please select both start and end times for the chosen days.`;
      hasPerRowErrors = true;
    }

    if (startStr && endStr) {
      const [sh, sm] = startStr.split(':').map(Number);
      const [eh, em] = endStr.split(':').map(Number);
      if (sh * 60 + sm >= eh * 60 + em) {
        (errors as any)[`visitationSchedule_row_${idx}_end`] =
          `Row ${idx + 1}: End time must be after start time.`;
        hasPerRowErrors = true;
      }
    }

    if (days.length > 0 && startStr && endStr) {
      validRowCount++;
      pruned.push(row);
    }
  });

  if (
    form.agreementType === 'Custody' &&
    form.visitationSchedule === 'Custom' &&
    validRowCount === 0 &&
    !hasPerRowErrors
  ) {
    const message = `${schemaEntry?.label || 'Visitation Schedule'} is required: add at least one row with days and a start–end time.`;
    (errors as Record<string, string>).visitationScheduleEntries = message;
    (errors as Record<string, string>)[`visitationSchedule_row_0_days`] = message;
  }

  return pruned;
}

