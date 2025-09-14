// src/types/EmploymentAgreementFieldConfig.ts

import type { EmploymentAgreementFormData } from './EmploymentAgreementFormData';

export interface EmploymentAgreementFieldConfig {
  label: string;
  type: string; // 'text', 'textarea', 'dropdown', 'checkbox', 'date', 'number'
  required: boolean;
  placeholder?: string;
  clauseTemplate?: string;
  options?: string[];
  validate?: (val: string, form?: EmploymentAgreementFormData) => boolean;
  default?: string;
  showIf?: (form: EmploymentAgreementFormData) => boolean;
  group?: 'main' | 'clauses';
  inlineWith?: keyof EmploymentAgreementFormData;
  disabled?: boolean;
}

