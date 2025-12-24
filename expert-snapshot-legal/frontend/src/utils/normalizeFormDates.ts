// src/utils/normalizeFormDates.ts

/**
 * Normalize specified date fields in a form object.
 * - Preserves ISO strings (`yyyy-mm-dd`)
 * - Converts `MM/DD/YYYY` into ISO format
 * - Trims whitespace
 * - Returns empty string if invalid
 */
export function normalizeFormDates<T extends Record<string, any>>(
  formData: T,
  keys: (keyof T)[]
): T {
  const normalized: Partial<T> = { ...formData };

  for (const key of keys) {
    const value = formData[key];

    if (typeof value === 'string') {
      const trimmed = value.trim();

      // ISO format
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        normalized[key] = trimmed as T[keyof T];
        continue;
      }

      // US format MM/DD/YYYY
      const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
      if (match) {
        const [, mm, dd, yyyy] = match;
        normalized[key] = `${yyyy}-${mm}-${dd}` as T[keyof T];
        continue;
      }

      // Fallback: invalid → empty string
      normalized[key] = '' as T[keyof T];
    }
  }

  return normalized as T;
}

/**
 * Normalize a single date string into ISO format.
 * - Preserves ISO strings (`yyyy-mm-dd`)
 * - Converts `MM/DD/YYYY` into ISO format
 * - Trims whitespace
 * - Returns empty string if invalid
 */
export function normalizeSingleDate(input: unknown): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();

  // ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // US format MM/DD/YYYY
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback: invalid → empty string
  return '';
}
