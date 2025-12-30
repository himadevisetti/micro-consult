// src/utils/validateChildren.ts
import type { FamilyLawAgreementFormData, ChildEntry } from '../types/FamilyLawAgreementFormData';
import type { FamilyLawAgreementValidationErrors } from './parseAndValidateFamilyLawAgreementForm';

export function validateChildren(
  form: FamilyLawAgreementFormData,
  errors: FamilyLawAgreementValidationErrors,
  schemaEntry: any
): ChildEntry[] {
  const children: ChildEntry[] = Array.isArray(form.children) ? form.children : [];
  const pruned: ChildEntry[] = [];
  let validCount = 0;

  children.forEach((child, idx) => {
    const name = (child?.name || '').trim();
    const dob = (child?.dob || '').trim();
    const hasAny = !!name || !!dob;

    if (!hasAny) return;

    if (!name) {
      const key = `children_row_${idx}_name`;
      (errors as Record<string, string>)[key] = `Row ${idx + 1}: Child name is required.`;
    }
    if (!dob) {
      const key = `children_row_${idx}_dob`;
      (errors as Record<string, string>)[key] = `Row ${idx + 1}: Date of birth is required.`;
    }

    if (name && dob) {
      validCount++;
      pruned.push({ name, dob });
    }
  });

  if (form.agreementType === 'Custody' && validCount === 0) {
    const message = `${schemaEntry?.label || 'Children'} is required: add at least one child with name and date of birth.`;
    (errors as Record<string, string>).children = message;
    (errors as Record<string, string>)['children_row_0_name'] = message;
  }

  return pruned;
}
