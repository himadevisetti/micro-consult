// src/types/FamilyLawAgreementFieldConfig.ts
import type {
  FamilyLawAgreementFormData,
  VisitationScheduleEntry,
  ChildEntry
} from './FamilyLawAgreementFormData';

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
  type: 'multiselect' | 'time-range' | 'text' | 'date';
  options?: { value: string; label: string }[];
  step?: number;        // for time-range increments
  startLabel?: string;  // for time-range UX
  endLabel?: string;    // for time-range UX
  placeholder?: string; // allow placeholder text for text/date inputs
}

/**
 * Generic config for any field in the Family Law Agreement form.
 * Default value type is string so existing string-based validate() continue to work.
 */
export interface FamilyLawAgreementFieldConfig<T = string> {
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  clauseTemplate?: string;
  options?: string[];
  suggestions?: string[];

  // Now typed to T; for most fields T defaults to string
  validate?: (val: T, form?: FamilyLawAgreementFormData) => boolean;

  default?: T;
  showIf?: (form: FamilyLawAgreementFormData) => boolean;
  group?: 'main' | 'clauses';
  inlineWith?: keyof FamilyLawAgreementFormData;
  disabled?: boolean;

  // For inline-pair fields (used by visitationSchedule, children)
  pair?: InlinePairField[];

  // Explicit override: if true, this field’s inline-pair is optional even when visible
  pairOptional?: boolean;

  // If this field is an array-like value, join defines how to stringify it (e.g., for clauses)
  join?: (entries: T extends any[] ? T : never) => string;

  // Renderer hint for inline-pair fields
  renderer?: 'generic-inline-pair' | 'visitation-inline-pair';
}

/** Specialized config type for the Visitation Schedule field (array of entries) */
export type VisitationScheduleFieldConfig = FamilyLawAgreementFieldConfig<VisitationScheduleEntry[]> & {
  type: 'inline-pair';
  pair: InlinePairField[];
  join: (entries: VisitationScheduleEntry[]) => string;
  renderer: 'visitation-inline-pair';
};

/** Specialized config type for the Children field (array of {name, dob}) */
export type ChildrenFieldConfig = FamilyLawAgreementFieldConfig<ChildEntry[]> & {
  type: 'inline-pair';
  pair: [
    { key: 'name'; label: 'Name'; type: 'text' },
    { key: 'dob'; label: 'Date of Birth'; type: 'date' }
  ];
  join: (entries: ChildEntry[]) => string;
  renderer: 'generic-inline-pair';
};
