export function normalizeFormDates<T extends Record<string, any>>(
  formData: T,
  keys: (keyof T)[]
): T {
  const normalized: Partial<T> = { ...formData };

  for (const key of keys) {
    const value = formData[key];
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // ✅ Preserve raw string — no Date conversion
      normalized[key] = value as T[keyof T];
    }
  }

  return normalized as T;
}
