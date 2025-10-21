import { Candidate } from "../../types/Candidate";

/**
 * Deduplicate candidates by rawValue (case-insensitive).
 * Keeps the first occurrence and preserves its original casing.
 */
export function dedupeCandidates(candidates: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  const unique: Candidate[] = [];

  for (const c of candidates) {
    const key = c.rawValue.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }

  return unique;
}

