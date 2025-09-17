// src/types/EmploymentAgreementFieldConfig.ts

import type { EmploymentAgreementFormData } from './EmploymentAgreementFormData';

export interface EmploymentAgreementFieldConfig {
  label: string;
  type: string; // 'text', 'textarea', 'dropdown', 'checkbox', 'date', 'number'
  required: boolean;
  placeholder?: string;
  clauseTemplate?: string;
  options?: string[];
  /**
   * Optional list of suggested values for this field.
   * The renderer can display these as clickable items to help the user fill the field.
   * For example, Benefits can show common perks like "Health Insurance" or "Paid Time Off".
   */
  suggestions?: string[];
  validate?: (val: string, form?: EmploymentAgreementFormData) => boolean;
  default?: string;
  showIf?: (form: EmploymentAgreementFormData) => boolean;
  group?: 'main' | 'clauses';
  inlineWith?: keyof EmploymentAgreementFormData;
  disabled?: boolean;
}
