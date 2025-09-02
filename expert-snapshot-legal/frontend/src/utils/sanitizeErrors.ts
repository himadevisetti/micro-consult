export function sanitizeErrors(errors: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, String(value)])
  );
}