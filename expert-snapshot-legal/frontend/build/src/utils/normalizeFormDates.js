export function normalizeFormDates(formData, keys) {
    const normalized = { ...formData };
    for (const key of keys) {
        const value = formData[key];
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            // ✅ Preserve raw string — no Date conversion
            normalized[key] = value;
        }
    }
    return normalized;
}
