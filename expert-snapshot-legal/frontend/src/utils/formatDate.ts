// src/utils/formatDate.ts

/**
 * Formats a Date object into MM-DD-YYYY string.
 * Returns empty string if input is invalid.
 */
export function formatDateMMDDYYYY(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

