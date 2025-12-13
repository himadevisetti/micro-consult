// src/types/RealEstateContractFieldConfig.ts
import type { RealEstateContractFormData } from './RealEstateContractFormData';

/** All supported field types in the form schema */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'inline-pair';

/**
 * Generic config for any field in the Real Estate Contract form.
 * Default value type is string so existing string-based validate() continue to work.
 */
export interface RealEstateContractFieldConfig<T = string> {
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  clauseTemplate?: string;
  options?: string[];
  suggestions?: string[];

  // Typed to T; for most fields T defaults to string
  validate?: (val: T, form?: RealEstateContractFormData) => boolean;

  default?: T;
  showIf?: (form: RealEstateContractFormData) => boolean;
  group?: 'main' | 'clauses';
  inlineWith?: keyof RealEstateContractFormData;
  disabled?: boolean;

  // For inline-pair fields (e.g. commissionValue + commissionUnit)
  pair?: {
    key: string;
    label: string;
    type: 'text' | 'dropdown';
    options?: { value: string; label: string }[];
    step?: number;
    startLabel?: string;
    endLabel?: string;
  }[];

  pairOptional?: boolean;

  // If this field is an array-like value, join defines how to stringify it (e.g., for clauses)
  join?: (entries: T extends any[] ? T : never) => string;
}
