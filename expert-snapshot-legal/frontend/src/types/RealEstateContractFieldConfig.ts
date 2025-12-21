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
  /** Display label for the field */
  label: string;

  /** Input type (text, dropdown, checkbox, etc.) */
  type: FieldType;

  /** Always required (e.g. propertyAddress, signatory fields) */
  required?: boolean;

  /**
   * Conditionally required based on contractType or other form data.
   * Optional now, since most flows rely on showIf for visibility.
   */
  requiredIf?: (form: RealEstateContractFormData) => boolean;

  /** Conditionally visible based on contractType or other form data */
  showIf?: (form: RealEstateContractFormData) => boolean;

  /** Placeholder text for inputs */
  placeholder?: string;

  /** Clause template string for contract generation */
  clauseTemplate?: string;

  /** Dropdown options */
  options?: string[];

  /** Suggested values (e.g. for textarea with suggestions) */
  suggestions?: string[];

  /** Validation function for the field */
  validate?: (val: T, form?: RealEstateContractFormData) => boolean;

  /** Default value */
  default?: T;

  /** Grouping for UI layout */
  group?: 'main' | 'clauses';

  /** Inline pairing with another field (e.g. commissionValue + commissionUnit) */
  inlineWith?: keyof RealEstateContractFormData;

  /** Disable field in UI */
  disabled?: boolean;

  /** For inline-pair fields (e.g. commissionValue + commissionUnit) */
  pair?: {
    key: string;
    label: string;
    type: 'text' | 'dropdown';
    options?: { value: string; label: string }[];
    step?: number;
    startLabel?: string;
    endLabel?: string;
  }[];

  /** Whether the inline pair is optional */
  pairOptional?: boolean;

  /**
   * If this field is an array-like value, join defines how to stringify it
   * (e.g., for clauses with multiple lines).
   */
  join?: (entries: T extends any[] ? T : never) => string;
}