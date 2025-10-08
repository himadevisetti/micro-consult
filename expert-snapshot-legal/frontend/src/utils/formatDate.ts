// src/utils/formatDate.ts

/**
 * Formats a Date object or "YYYY-MM-DD" string into "Month Day, Year" (e.g. September 1, 2025).
 * Returns empty string if input is invalid.
 */
export function formatDateLong(date: Date | string): string {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    date = new Date(year, month - 1, day); // ✅ local time, no drift
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

/**
 * Converts MM/DD/YYYY string to ISO format ("YYYY-MM-DD").
 */
export function mmddToIso(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const [mm, dd, yyyy] = dateStr.split('/');
  if (!mm || !dd || !yyyy) return '';
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/**
 * Converts a Date object to ISO string ("YYYY-MM-DD").
 */
export function dateToIsoString(date?: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parses a manually entered date string into a UTC Date object.
 * Supports MM/DD/YYYY, MM/DD, YYYY-MM-DD, and MM-DD-YYYY formats.
 */
export function parseManualDateAsUTC(input: string): Date | undefined {
  const trimmed = input.trim();

  // MM/DD/YYYY
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      const parsed = new Date(Date.UTC(+year, +month - 1, +day));
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    if (parts.length === 2) {
      const [month, day] = parts;
      const year = new Date().getUTCFullYear();
      const parsed = new Date(Date.UTC(year, +month - 1, +day));
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  // MM-DD-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [month, day, year] = trimmed.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
}

/**
 * Formats a Date object into MM/DD/YYYY string.
 * Example: new Date(2025, 7, 21) → "08/21/2025"
 */
export function formatDateMMDDYYYY(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * Returns true if the schema field name looks like a date field.
 */
export function isDateLike(field: string | null): boolean {
  return !!field && field.toLowerCase().includes("date");
}

/**
 * Parses a raw string into ISO "YYYY-MM-DD" format if valid.
 */
export function parseIsoDate(raw: string): string | undefined {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}