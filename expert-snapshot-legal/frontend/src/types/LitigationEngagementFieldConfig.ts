// src/types/LitigationEngagementFieldConfig.ts

import type { LitigationEngagementFormData } from './LitigationEngagementFormData';

export interface LitigationEngagementFieldConfig {
  label: string;                                // UI label
  type: string;                                 // 'text', 'textarea', 'dropdown', 'checkbox', 'date', 'number'
  required: boolean;                            // whether field is mandatory
  placeholder?: string;                         // optional placeholder text
  clauseTemplate?: string;                      // optional clause template reference
  options?: string[];                           // for dropdowns (e.g., FeeStructure)
  validate?: (val: string, form?: LitigationEngagementFormData) => boolean; // optional validator
  default?: string;                             // optional default value
}
