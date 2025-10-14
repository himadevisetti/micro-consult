import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";

export function extractGoverningLaw(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading list for Governing Law
  const GOVLAW_HEADINGS = CONTRACT_KEYWORDS.headings.byField.governingLaw.map(normalizeHeading);

  // Find the start of the Governing Law section
  const startIdx = anchors.findIndex(a =>
    GOVLAW_HEADINGS.includes(normalizeHeading(a.text))
  );
  if (startIdx === -1) {
    return candidates; // no governing law section found
  }

  // Find the end (next heading after Governing Law)
  let endIdx = anchors.length;
  for (let i = startIdx + 1; i < anchors.length; i++) {
    const norm = normalizeHeading(anchors[i].text);
    // stop at the next recognized heading
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

  for (const anchor of bodyAnchors) {
    const match = anchor.text.match(/laws of\s+([A-Za-z\s]+)/i);
    if (match) {
      const raw = match[1].trim();
      candidates.push({
        rawValue: raw,
        schemaField: "governingLaw",
        candidates: ["governingLaw"],
        pageNumber: anchor.page,
        yPosition: anchor.y,
        roleHint: anchor.roleHint,
        sourceText: anchor.text,
      });
      logDebug(">>> governingLaw.detected", {
        governingLaw: raw,
        page: anchor.page,
        y: anchor.y,
        sourcePreview: anchor.text.slice(0, 80),
      });
    }
  }

  return candidates;
}
