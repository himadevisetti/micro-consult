// src/utils/candidates/mergeCandidates.ts

import { Candidate } from "../../types/Candidate";
import { logDebug } from "../../utils/logger.js";
import { normalizeBySchema } from "../../utils/normalizeValue.js";
import { isPreferredHeading } from "./isPreferredHeading.js";

const TRACE = process.env.DEBUG_TRACE === "true";

/**
 * Merge candidates, deduping by schemaField + normalized value.
 */
export function mergeCandidates(candidates: Candidate[]): Candidate[] {
  if (!candidates?.length) {
    logDebug(">>> mergeCandidates: no input candidates");
    return [];
  }

  if (TRACE) {
    logDebug(">>> mergeCandidates INPUT (full dump):");
    candidates.forEach((c, i) => {
      const schema = c.schemaField ?? "null";
      const normKey = c.schemaField
        ? `${c.schemaField}::${normalizeBySchema(c.rawValue, c.schemaField)}`
        : "(passthrough)";
      logDebug(
        `[${i}] field=${schema} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" normalized="${c.normalized ?? ""}" raw="${c.rawValue}" key=${normKey}`
      );
    });
  } else {
    logDebug(`>>> mergeCandidates INPUT: count=${candidates.length}`);
  }

  const indexByKey = new Map<string, number>();
  const out: Candidate[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];

    if (c.schemaField == null) {
      out.push({ ...c });
      continue;
    }

    const norm = normalizeBySchema(c.rawValue, c.schemaField);
    const key = `${c.schemaField}::${norm}`;
    const existingIdx = indexByKey.get(key);

    if (existingIdx == null) {
      const next: Candidate = { ...c };
      if (!next.normalized && c.schemaField && c.schemaField.toLowerCase().includes("date")) {
        const d = new Date(c.rawValue);
        if (!isNaN(d.getTime())) {
          next.normalized = d.toISOString().slice(0, 10);
        }
      }
      indexByKey.set(key, out.length);
      out.push(next);
      if (TRACE) {
        logDebug(
          `ADD key=${key} @outIdx=${out.length - 1} field=${c.schemaField} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" raw="${c.rawValue}"`
        );
      }
      continue;
    }

    const existing = out[existingIdx];

    let shouldReplace = false;
    {
      const existingPreferred = isPreferredHeading(c.schemaField, existing.roleHint);
      const incomingPreferred = isPreferredHeading(c.schemaField, c.roleHint);

      if (TRACE) {
        logDebug(
          `DUP key=${key} existingIdx=${existingIdx} ` +
          `existing(roleHint="${existing.roleHint ?? ""}", preferred=${existingPreferred}, page=${existing.pageNumber}, y=${existing.yPosition}) ` +
          `incoming(roleHint="${c.roleHint ?? ""}", preferred=${incomingPreferred}, page=${c.pageNumber}, y=${c.yPosition})`
        );
      }

      if (!existingPreferred && incomingPreferred) {
        shouldReplace = true;
        if (TRACE) {
          logDebug(`REPLACE_DECISION: ${c.schemaField} incoming is preferred-heading, existing is not. key=${key}`);
        }
      } else if (TRACE) {
        logDebug(`KEEP_DECISION: ${c.schemaField} prefers first occurrence or both preferred; merging metadata only. key=${key}`);
      }
    }

    if (shouldReplace) {
      out[existingIdx] = { ...existing, ...c };
      if (TRACE) {
        logDebug(
          `REPLACED key=${key} @outIdx=${existingIdx} with incoming (page=${c.pageNumber}, y=${c.yPosition}, roleHint="${c.roleHint ?? ""}")`
        );
      }
    } else {
      const mergedLabels = Array.from(new Set([...(existing.candidates ?? []), ...(c.candidates ?? [])]));
      if (mergedLabels.length) existing.candidates = mergedLabels;
      if (!existing.normalized && c.normalized) existing.normalized = c.normalized;
      if (!existing.displayValue && c.displayValue) existing.displayValue = c.displayValue;
      if (!existing.roleHint && c.roleHint) existing.roleHint = c.roleHint;

      if (TRACE) {
        logDebug(
          `MERGED_METADATA key=${key} @outIdx=${existingIdx} normalized="${existing.normalized ?? ""}" displayValue="${existing.displayValue ?? ""}" roleHint="${existing.roleHint ?? ""}"`
        );
      }
    }
  }

  if (TRACE) {
    logDebug(">>> mergeCandidates OUTPUT (full dump):");
    out.forEach((c, i) => {
      const schema = c.schemaField ?? "null";
      const normKey = c.schemaField
        ? `${c.schemaField}::${normalizeBySchema(c.rawValue, c.schemaField)}`
        : "(passthrough)";
      logDebug(
        `[${i}] field=${schema} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" normalized="${c.normalized ?? ""}" raw="${c.rawValue}" key=${normKey}`
      );
    });
  } else {
    logDebug(`>>> mergeCandidates OUTPUT: count=${out.length}`);
  }

  return out;
}
