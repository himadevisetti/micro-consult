import { normalizeHeading } from "./normalizeValue.js";

export function headingMatches(roleHint: string, keywords: string[]): boolean {
  const normRole = normalizeHeading(roleHint);
  return (
    keywords.includes(normRole) || // exact match
    keywords.some(k => normRole.includes(k)) // substring match
  );
}