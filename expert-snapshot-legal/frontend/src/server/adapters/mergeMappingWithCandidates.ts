import { NormalizedMapping } from "../../types/confirmMapping.js";
import type { Candidate } from "../../types/Candidate.js";
import { logDebug } from "../../utils/logger.js";

export function mergeMappingWithCandidates(
  normalized: NormalizedMapping[],
  stored: Candidate[]
): Candidate[] {
  // Deleted fields
  const deletedFields = new Set(
    normalized.filter(n => (n as any).deleted).map(n => n.schemaField ?? "")
  );
  logDebug("merge.deletedSet", Array.from(deletedFields));

  // Active entries
  const active = normalized.filter(n => !(n as any).deleted);
  const byField = new Map<string, NormalizedMapping>();
  for (const m of active) {
    if (m.schemaField) byField.set(m.schemaField, m);
  }

  const merged: Candidate[] = [];

  for (const c of stored) {
    const cKey = c.schemaField ?? "";
    if (deletedFields.has(cKey)) {
      logDebug("merge.skipDeleted", { schemaField: c.schemaField, raw: c.rawValue });
      continue;
    }

    let m: NormalizedMapping | undefined;
    if (c.schemaField) {
      m = byField.get(c.schemaField);
    } else {
      m = active.find(n => n.raw === c.rawValue);
    }

    if (m) {
      logDebug("merge.update", { from: c.schemaField, to: m.schemaField, raw: c.rawValue });
      merged.push({
        ...c,
        schemaField: m.schemaField,
        placeholder: m.placeholder ?? c.placeholder,
        normalized: m.normalized ?? c.normalized,
        rawValue: m.raw ?? c.rawValue,
      });
    } else {
      merged.push(c);
    }
  }

  // Append new variables
  for (const m of active) {
    const exists = merged.some(c => c.schemaField === m.schemaField);
    if (m.schemaField && !exists) {
      logDebug("merge.newVariable", { schemaField: m.schemaField, raw: m.raw });
      merged.push({
        rawValue: m.raw ?? "",
        schemaField: m.schemaField,
        placeholder: m.placeholder,
        normalized: m.normalized,
        candidates: [],
      } as Candidate);
    }
  }

  logDebug("merge.final", merged.map(c => ({
    schemaField: c.schemaField,
    raw: c.rawValue,
  })));

  return merged;
}
