// src/utils/validateContactField.ts
import type { FamilyLawAgreementFormData } from '../types/FamilyLawAgreementFormData';
import type { FamilyLawAgreementValidationErrors } from './parseAndValidateFamilyLawAgreementForm';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;

const contactFields: (keyof FamilyLawAgreementFormData)[] = [
  'petitionerContact',
  'respondentContact',
  'motherContact',
  'fatherContact',
  'spouse1Contact',
  'spouse2Contact',
];

export function validateContactFields(
  form: FamilyLawAgreementFormData,
  errors: FamilyLawAgreementValidationErrors,
  schema: Record<string, any>
) {
  contactFields.forEach((field) => {
    const value = form[field] as string | undefined;
    if (!value) return;

    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      errors[field] = `${schema[field]?.label || field} must be a valid phone number or email.`;
    }
  });
}

