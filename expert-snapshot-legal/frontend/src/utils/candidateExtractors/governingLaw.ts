import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

export function extractGoverningLaw(blocks: ClauseBlock[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Find the Governing Law block by roleHint
  const block = blocks.find(
    b => b.roleHint && b.roleHint.toLowerCase() === "governing law"
  );
  if (!block) return candidates;

  const text = block.body;

  // Use configured cues
  const cues = CONTRACT_KEYWORDS.governingLaw?.cues ?? [];
  let raw: string | undefined;
  let cueUsed: string | undefined;

  for (const cue of cues) {
    const re = new RegExp(`${cue}\\s+([A-Za-z\\s]+)`, "i");
    const m = text.match(re);
    if (m) {
      raw = m[1].trim().replace(/[.,;]+$/, "");
      cueUsed = cue;
      break;
    }
  }

  if (!raw) return candidates;

  candidates.push({
    rawValue: raw,
    schemaField: "governingLaw",
    candidates: ["governingLaw"],
    pageNumber: block.pageNumber,
    yPosition: block.yPosition,
    roleHint: block.roleHint,
    sourceText: block.body,
  });

  logDebug(">>> governingLaw.detected", {
    governingLaw: raw,
    cue: cueUsed,
    page: block.pageNumber,
    y: block.yPosition,
    sourcePreview: block.body,
    // sourcePreview: block.body.slice(0, 80),
  });

  return candidates;
}
