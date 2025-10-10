import { FIELD_LABELS, PLACEHOLDER_KEYWORDS } from "../constants/contractKeywords";

/**
 * Format a schemaField into a user‑friendly label for dropdowns/UI.
 */
export function formatFieldLabel(schemaField: string): string {
  const match = schemaField.match(/^([a-zA-Z]+)(\d+)?$/);
  if (!match) return schemaField;

  const base = match[1];
  const num = match[2];
  const baseLabel = FIELD_LABELS[base] ?? base;

  return num ? `${baseLabel} #${num}` : baseLabel;
}

/**
 * Convert a schemaField into a canonical placeholder token for manifests/templates.
 * Always uses PascalCase from PLACEHOLDER_KEYWORDS, preserving numeric suffixes.
 */
export function toPlaceholder(schemaField: string | null | undefined): string | undefined {
  if (!schemaField) return undefined;

  const digits = (schemaField.match(/\d+$/) || [])[0];
  const base = schemaField.replace(/\d+$/, "").toLowerCase();
  const token = (PLACEHOLDER_KEYWORDS as Record<string, string>)[base];

  if (!token) return undefined;
  return digits ? `{{${token}${digits}}}` : `{{${token}}}`;
}
