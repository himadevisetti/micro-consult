import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../../utils/normalizeValue.js";

/**
 * Returns true if the given roleHint matches one of the preferred
 * heading variants for the given schemaField.
 */
export function isPreferredHeading(schemaField: string, roleHint?: string): boolean {
  const h = normalizeHeading(roleHint);
  const variants =
    (CONTRACT_KEYWORDS.headings.byField as Record<string, string[]>)[schemaField] ?? [];
  return variants.map(normalizeHeading).includes(h);
}

