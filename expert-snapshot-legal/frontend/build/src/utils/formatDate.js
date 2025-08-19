// src/utils/formatDate.ts
/**
 * Formats a Date object or "YYYY-MM-DD" string into "Month Day, Year" (e.g. September 1, 2025).
 * Returns empty string if input is invalid.
 */
export function formatDateLong(date) {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        date = new Date(year, month - 1, day); // ✅ local time, no drift
    }
    if (!(date instanceof Date) || isNaN(date.getTime()))
        return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
}
/**
 * Converts a date to a string by using the current or specified locale
 */
export function formatDateLongFromString(dateStr) {
    const date = new Date(dateStr);
    return formatDateLong(date);
}
// Reserved for machine-readable formats (e.g. API payloads, CSV exports)
export function formatDateMMDDYYYY(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}
/**
 * Formats a Date object into "YYYY-MM-DD" without UTC drift.
 * Safe for sessionStorage and API payloads.
 */
export function formatDateYYYYMMDD(date) {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
