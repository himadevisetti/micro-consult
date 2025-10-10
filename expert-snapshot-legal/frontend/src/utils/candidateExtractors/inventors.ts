import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

/**
 * Inventor extraction:
 * - Scope: only anchors containing parties.inventorCues
 * - Extract: names after "created by / invented by / originated by / conceived by"
 * - Supports: "the Inventor" (default role label)
 * - Output: inventor candidates with schemaField inventor1…N
 */
export function extractInventors(anchors: TextAnchor[]): Candidate[] {
  const rawCandidates: Candidate[] = [];

  for (const anchor of anchors) {
    const text = anchor.text.trim();
    const lower = text.toLowerCase();

    // Scope by cues (mirror governing law pattern)
    if (!CONTRACT_KEYWORDS.parties.inventorCues.some(k => lower.includes(k))) {
      continue;
    }

    // Pattern A: "... created by/invented by/originated by/conceived by <names>"
    const byMatch = text.match(
      /\b(?:created by|invented by|originated by|conceived by)\s+(.+)/i
    );
    if (byMatch) {
      const tail = byMatch[1];
      const parts = tail.split(/,| and /i).map(p => p.trim());

      for (const part of parts) {
        const clean = part.replace(
          /\b(effective|dated|commencing|during|pursuant)\b.*$/i,
          ""
        ).trim();

        if (isLikelyName(clean)) {
          rawCandidates.push(toInventorCandidate(clean, anchor));
          logDebug("inventor.detected", {
            text,
            name: clean,
            page: anchor.page,
            y: anchor.y,
            roleHint: anchor.roleHint,
          });
        }
      }
      continue;
    }

    // Pattern B: generated default label "the Inventor"
    if (/^\bthe\s+inventor\b$/i.test(text)) {
      rawCandidates.push(toInventorCandidate("the Inventor", anchor));
      logDebug("inventor.defaultRoleDetected", {
        text,
        value: "the Inventor",
        page: anchor.page,
        y: anchor.y,
        roleHint: anchor.roleHint,
      });
      continue;
    }
  }

  // Deduplicate and assign inventor1…N in schemaField and candidates
  const deduped = dedupeByRawValue(rawCandidates);
  return deduped.map((c, idx) => {
    const schemaField = deduped.length > 1 ? `inventor${idx + 1}` : "inventor";
    return {
      ...c,
      schemaField,
      candidates: [schemaField], // ✅ align candidates with schemaField
    };
  });
}

// Helpers
function toInventorCandidate(rawValue: string, anchor: TextAnchor): Candidate {
  return {
    rawValue,
    schemaField: "inventor", // temporary, will be replaced with inventor1…N
    candidates: ["inventor"],
    pageNumber: anchor.page,
    yPosition: anchor.y,
    roleHint: "Inventor",
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
