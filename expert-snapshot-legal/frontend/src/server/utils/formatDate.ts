// src/server/utils/formatDate.ts

/**
 * Formats a "YYYY-MM-DD" string into "Month Day, Year" (e.g. October 9, 2025).
 * Returns the original string if invalid.
 */
export function formatDateLong(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC', // or your desired TZ
      });
    }
  }
  return dateStr;
}
