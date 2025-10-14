import { NormalizedMapping } from "../../types/confirmMapping.js";
import type { Candidate } from "../../types/Candidate.js";
import { logDebug } from "../../utils/logger.js";

export function mergeMappingWithCandidates(
  normalized: NormalizedMapping[],
  stored: Candidate[]
): Candidate[] {
  return stored.map((c) => {
    let matchedBy: "strict" | "raw" | "schema" | "none" = "none";
    let m =
      normalized.find(
        (nm) => nm.raw === c.rawValue && nm.schemaField === c.schemaField
      ) || null;

    if (m) {
      matchedBy = "strict";
    } else {
      m = normalized.find((nm) => nm.raw === c.rawValue) || null;
      if (m) matchedBy = "raw";
    }

    if (!m) {
      m = normalized.find((nm) => nm.schemaField === c.schemaField) || null;
      if (m) matchedBy = "schema";
    }

    const result = m
      ? {
        ...c,
        schemaField: m.schemaField,
        placeholder: m.placeholder,
        normalized: m.normalized,
      }
      : c;

    // Only log interesting cases (changed or FilingParty)
    if (m || c.schemaField === "FilingParty" || result.schemaField === "FilingParty") {
      logDebug("mergeMapping.apply", {
        matchedBy,
        candidate: {
          rawValue: c.rawValue,
          beforeSchema: c.schemaField,
          beforePlaceholder: c.placeholder,
          pageNumber: c.pageNumber,
          yPosition: c.yPosition,
        },
        mapping: m
          ? {
            raw: m.raw,
            schemaField: m.schemaField,
            placeholder: m.placeholder,
          }
          : null,
        after: {
          schemaField: result.schemaField,
          placeholder: result.placeholder,
        },
      });
    }

    return result;
  });
}
