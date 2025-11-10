import { FIELD_LABELS, PLACEHOLDER_KEYWORDS, ACRONYMS } from "../constants/contractKeywords";

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
export function toPlaceholder(schemaField: string | null | undefined): string {
  if (!schemaField || !schemaField.trim()) {
    return "[[Field]]"; // generic fallback
  }

  // Extract trailing digits (e.g. Inventor1 → "1")
  const digits = (schemaField.match(/\d+$/) || [])[0] ?? "";
  const base = schemaField.replace(/\d+$/, "").toLowerCase();

  // Look up canonical token, fallback to capitalized schemaField
  const token =
    (PLACEHOLDER_KEYWORDS as Record<string, string>)[base] ??
    capitalize(schemaField.replace(/\d+$/, ""));

  return digits ? `[[${token}${digits}]]` : `[[${token}]]`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function toCamelCase(label: string): string {
  const trimmed = label.trim();
  if (/^[a-z][a-zA-Z0-9]*$/.test(trimmed)) {
    return trimmed; // already camelCase, skip
  }

  const tokens = trimmed
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .split(" ");

  return tokens
    .map((token, i) => {
      const lower = token.toLowerCase();
      if (ACRONYMS.has(lower)) return lower;
      return i === 0
        ? lower
        : token[0].toUpperCase() + token.slice(1).toLowerCase();
    })
    .join("");
}
