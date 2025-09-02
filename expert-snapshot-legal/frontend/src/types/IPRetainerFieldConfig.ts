// src/types/IPRetainerFieldConfig.ts

import type { IPRightsLicensingFormData } from './IPRightsLicensingFormData';

export interface IPRetainerFieldConfig {
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  clauseTemplate?: string;
  options?: string[];
  validate?: (val: string, form?: IPRightsLicensingFormData) => boolean;
  default?: string;
}

