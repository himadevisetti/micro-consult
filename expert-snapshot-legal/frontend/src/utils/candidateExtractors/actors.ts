// src/utils/candidateExtractors/actors.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";

export function extractActors(blocks: ClauseBlock[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading list for Parties/Actors (includes Inventors variants)
  const ACTOR_HEADINGS = (CONTRACT_KEYWORDS.headings.byField.parties || []).map(normalizeHeading);

  // Find the Parties/Actors block
  const block = blocks.find(
    b => b.roleHint && ACTOR_HEADINGS.includes(normalizeHeading(b.roleHint))
  );
  if (!block) return candidates;

  const lines = block.body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // --- Parties extraction ---
  for (const line of lines) {
    const partyRegex = /between\s+(.+?)\s+and\s+([^.,]+)(?:[.,]|$)/i;
    const match = line.match(partyRegex);
    if (match) {
      const clean = (s: string) =>
        s.replace(/\s*,?\s*effective as of.*$/i, "")
          .replace(/\s*,?\s*dated.*$/i, "")
          .trim();

      let partyA = clean(match[1]);
      let partyB = clean(match[2]);

      const labelRegex = /\(the\s+["“]?([A-Za-z]+)["”]?\)/i;
      const labelA = partyA.match(labelRegex)?.[1];
      const labelB = partyB.match(labelRegex)?.[1];

      partyA = partyA.replace(labelRegex, "").trim();
      partyB = partyB.replace(labelRegex, "").trim();

      if (partyA && partyB) {
        const baseRoleHint = block.roleHint ?? "Parties";

        if (labelA || labelB) {
          candidates.push({
            rawValue: partyA,
            schemaField: "partyA",
            candidates: ["partyA"],
            roleHint: labelA || baseRoleHint,
            pageNumber: block.pageNumber,
            yPosition: block.yPosition,
            sourceText: line,
          });
          candidates.push({
            rawValue: partyB,
            schemaField: "partyB",
            candidates: ["partyB"],
            roleHint: labelB || baseRoleHint,
            pageNumber: block.pageNumber,
            yPosition: block.yPosition,
            sourceText: line,
          });
        } else {
          candidates.push({
            rawValue: partyA,
            schemaField: null,
            candidates: ["partyA", "partyB"],
            roleHint: baseRoleHint,
            pageNumber: block.pageNumber,
            yPosition: block.yPosition,
            sourceText: line,
          });
          candidates.push({
            rawValue: partyB,
            schemaField: null,
            candidates: ["partyA", "partyB"],
            roleHint: baseRoleHint,
            pageNumber: block.pageNumber,
            yPosition: block.yPosition,
            sourceText: line,
          });
        }

        logDebug(">>> Parties detected:", { partyA, partyB, labelA, labelB });
        break; // stop after first match
      }
    }
  }

  // --- Inventors extraction ---
  const rawInventors: Candidate[] = [];
  for (const line of lines) {
    const text = line.trim();

    const byMatch = text.match(
      /\b(?:created by|invented by|originated by|conceived by)\s+(.+)/i
    );
    if (byMatch) {
      const tail = byMatch[1];
      const parts = tail.split(/,| and /i).map(p => p.trim());

      for (const part of parts) {
        const clean = part
          .replace(/\b(effective|dated|commencing|during|pursuant)\b.*$/i, "")
          .trim();

        if (isLikelyName(clean)) {
          rawInventors.push(toInventorCandidate(clean, block, text));
          logDebug(">>> inventor.detected", {
            name: clean,
            page: block.pageNumber,
            y: block.yPosition,
            roleHint: block.roleHint,
            sourcePreview: text.slice(0, 80),
          });
        }
      }
      continue;
    }

    if (/^\bthe\s+inventor\b$/i.test(text)) {
      rawInventors.push(toInventorCandidate("the Inventor", block, text));
      logDebug(">>> inventor.defaultRoleDetected", {
        value: "the Inventor",
        page: block.pageNumber,
        y: block.yPosition,
        roleHint: block.roleHint,
        sourcePreview: text.slice(0, 80),
      });
      continue;
    }
  }

  const deduped = dedupeByRawValue(rawInventors);
  deduped.forEach((c, idx) => {
    const schemaField = deduped.length === 1 ? "inventor" : `inventor${idx + 1}`;
    candidates.push({
      ...c,
      schemaField,
      candidates: [schemaField],
      roleHint: "inventor",
    });
  });

  return candidates;
}

// Helpers
function toInventorCandidate(rawValue: string, block: ClauseBlock, sourceText: string): Candidate {
  return {
    rawValue,
    schemaField: "inventor", // temporary, replaced later
    candidates: ["inventor"],
    pageNumber: block.pageNumber,
    yPosition: block.yPosition,
    roleHint: block.roleHint,
    sourceText,
  };
}

function isLikelyName(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^[A-Z]/.test(trimmed)) return false;
  const tokens = trimmed.split(/\s+/);
  return tokens.length >= 1 && tokens.length <= 4;
}

function dedupeByRawValue(list: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  return list.filter(c => {
    const key = c.rawValue.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
