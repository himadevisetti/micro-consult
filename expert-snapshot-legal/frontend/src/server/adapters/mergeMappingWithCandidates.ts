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
      ) ||
      normalized.find((nm) => nm.raw === c.rawValue) ||
      normalized.find((nm) => nm.schemaField === c.schemaField) ||
      null;

    if (m) {
      return {
        ...c,                        // keep all candidate metadata
        schemaField: m.schemaField,  // override with confirmed mapping
        placeholder: m.placeholder,
        normalized: m.normalized,
      };
    }

    return c;
  });
}
