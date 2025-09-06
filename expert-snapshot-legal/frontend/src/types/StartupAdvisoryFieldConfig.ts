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
  /**
   * Optional function to determine if this field should be shown
   * based on the current form state.
   */
  showIf?: (form: StartupAdvisoryFormData) => boolean;

  /**
   * Optional grouping hint for rendering order or sectioning.
   * Example: 'main', 'clauses', 'checkboxes'
   */
  group?: 'main' | 'clauses';

  /**
   * Optional key of another field to render inline with this one.
   * Example: 'timeCommitmentUnit' for 'timeCommitmentValue'
   */
  inlineWith?: keyof StartupAdvisoryFormData;
}
