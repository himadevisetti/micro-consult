import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";

export function extractActors(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading list for Parties/Actors (includes Inventors variants)
  const ACTOR_HEADINGS = (CONTRACT_KEYWORDS.headings.byField.parties || []).map(normalizeHeading);

  // Find the start of the Parties/Actors section
  const startIdx = anchors.findIndex(a =>
    ACTOR_HEADINGS.includes(normalizeHeading(a.text))
  );
  if (startIdx === -1) {
    return candidates; // no Parties/Actors section found
  }

  // Find the end (next heading after Parties/Actors section)
  let endIdx = anchors.length;
  for (let i = startIdx + 1; i < anchors.length; i++) {
    const norm = normalizeHeading(anchors[i].text);
    if (
      Object.values(CONTRACT_KEYWORDS.headings.byField)
        .flat()
        .map(normalizeHeading)
        .includes(norm)
    ) {
      endIdx = i;
      break;
    }
  }

  // Collect body anchors between start and end
  const bodyAnchors = anchors.slice(startIdx + 1, endIdx);

  // --- Parties extraction ---
  for (const anchor of bodyAnchors) {
    const partyRegex = /between\s+(.+?)\s+and\s+([^.,]+)(?:[.,]|$)/i;
    const match = anchor.text.match(partyRegex);
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
        const baseRoleHint = anchor.roleHint ?? "Parties";

        if (labelA || labelB) {
          candidates.push({
            rawValue: partyA,
            schemaField: "partyA",
            candidates: ["partyA"],
            roleHint: labelA || baseRoleHint,
            pageNumber: anchor.page,
            yPosition: anchor.y,
            sourceText: anchor.text,
          });
          candidates.push({
            rawValue: partyB,
            schemaField: "partyB",
            candidates: ["partyB"],
            roleHint: labelB || baseRoleHint,
            pageNumber: anchor.page,
            yPosition: anchor.y,
            sourceText: anchor.text,
          });
        } else {
          candidates.push({
            rawValue: partyA,
            schemaField: null,
            candidates: ["partyA", "partyB"],
            roleHint: baseRoleHint,
            pageNumber: anchor.page,
            yPosition: anchor.y,
            sourceText: anchor.text,
          });
          candidates.push({
            rawValue: partyB,
            schemaField: null,
            candidates: ["partyA", "partyB"],
            roleHint: baseRoleHint,
            pageNumber: anchor.page,
            yPosition: anchor.y,
            sourceText: anchor.text,
          });
        }

        logDebug(">>> Parties detected:", { partyA, partyB, labelA, labelB });
        break; // stop after first match
      }
    }
  }

  // --- Inventors extraction ---
  const rawInventors: Candidate[] = [];
  for (const anchor of bodyAnchors) {
    const text = anchor.text.trim();

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
          rawInventors.push(toInventorCandidate(clean, anchor));
          logDebug(">>> inventor.detected", {
            name: clean,
            page: anchor.page,
            y: anchor.y,
            roleHint: anchor.roleHint,
            sourcePreview: anchor.text.slice(0, 80),
          });
        }
      }
      continue;
    }

    if (/^\bthe\s+inventor\b$/i.test(text)) {
      rawInventors.push(toInventorCandidate("the Inventor", anchor));
      logDebug(">>> inventor.defaultRoleDetected", {
        value: "the Inventor",
        page: anchor.page,
        y: anchor.y,
        roleHint: anchor.roleHint,
        sourcePreview: anchor.text.slice(0, 80),
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
function toInventorCandidate(rawValue: string, anchor: TextAnchor): Candidate {
  return {
    rawValue,
    schemaField: "inventor", // temporary, replaced later
    candidates: ["inventor"],
    pageNumber: anchor.page,
    yPosition: anchor.y,
    roleHint: anchor.roleHint,
    sourceText: anchor.text,
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
