// src/types/RetainerFieldConfig.ts

import type { RetainerFormData } from './RetainerFormData';

export interface RetainerFieldConfig {
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  clauseTemplate?: string;
  options?: string[];
  validate?: (val: string, form?: RetainerFormData) => boolean;
  default?: string;
}

