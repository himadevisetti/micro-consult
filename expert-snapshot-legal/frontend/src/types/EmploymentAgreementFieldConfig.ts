// src/types/EmploymentAgreementFieldConfig.ts
import type {
  EmploymentAgreementFormData,
  WorkScheduleEntry
} from './EmploymentAgreementFormData';

/** All supported field types in the form schema */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'inline-pair'
  | 'multiselect'
  | 'time-range';

/** Config for a single field inside an inline-pair */
export interface InlinePairField {
  key: string; // key inside the object for this pair
  label: string;
  type: 'multiselect' | 'time-range' | 'text';
  options?: { value: string; label: string }[];
  step?: number;        // for time-range increments
  startLabel?: string;  // for time-range UX
  endLabel?: string;    // for time-range UX
}

/**
 * Generic config for any field in the Employment Agreement form.
 * Default value type is string so existing string-based validate() continue to work.
 */
export interface EmploymentAgreementFieldConfig<T = string> {
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  clauseTemplate?: string;
  options?: string[];
  suggestions?: string[];

  // Now typed to T; for most fields T defaults to string
  validate?: (val: T, form?: EmploymentAgreementFormData) => boolean;

  default?: T;
  showIf?: (form: EmploymentAgreementFormData) => boolean;
  group?: 'main' | 'clauses';
  inlineWith?: keyof EmploymentAgreementFormData;
  disabled?: boolean;

  // For inline-pair fields (used by workSchedule)
  pair?: InlinePairField[];

  // Explicit override: if true, this field’s inline-pair is optional even when visible
  pairOptional?: boolean;

  // If this field is an array-like value, join defines how to stringify it (e.g., for clauses)
  join?: (entries: T extends any[] ? T : never) => string;
}

/** Specialized config type for the Work Schedule field (array of entries) */
export type WorkScheduleFieldConfig = EmploymentAgreementFieldConfig<WorkScheduleEntry[]> & {
  type: 'inline-pair';
  pair: InlinePairField[];
  join: (entries: WorkScheduleEntry[]) => string;
};
