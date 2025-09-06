// src/types/StartupAdvisoryFieldConfig.ts

import type { StartupAdvisoryFormData } from './StartupAdvisoryFormData';

export interface StartupAdvisoryFieldConfig {
  label: string;
  type: string; // e.g., 'text', 'textarea', 'dropdown', 'checkbox', 'date', 'number'
  required: boolean;
  placeholder?: string;
  clauseTemplate?: string;
  options?: string[];
  validate?: (val: string, form?: StartupAdvisoryFormData) => boolean;
  default?: string;
}

