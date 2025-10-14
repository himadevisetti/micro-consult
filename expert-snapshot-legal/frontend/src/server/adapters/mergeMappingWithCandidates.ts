import { NormalizedMapping } from "../../types/confirmMapping.js";
import type { Candidate } from "../../types/Candidate.js";

export function mergeMappingWithCandidates(
  normalized: NormalizedMapping[],
  stored: Candidate[]
): Candidate[] {
  return stored.map((c) => {
    let m =
      normalized.find(
        (nm) => nm.raw === c.rawValue && nm.schemaField === c.schemaField
      ) || null;

    if (!m) {
      m = normalized.find((nm) => nm.raw === c.rawValue) || null;
    }

    if (!m) {
      m = normalized.find((nm) => nm.schemaField === c.schemaField) || null;
    }

    return m
      ? {
        ...c,
        schemaField: m.schemaField,
        placeholder: m.placeholder,
        normalized: m.normalized,
      }
      : c;
  });
}
