import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";
import { collectSectionBody } from "../sectionUtils.js";

export function extractGoverningLaw(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading list for Governing Law
  const GOVLAW_HEADINGS = CONTRACT_KEYWORDS.headings.byField.governingLaw.map(normalizeHeading);

  // Use helper to collect section body
  const section = collectSectionBody(anchors, GOVLAW_HEADINGS);
  if (!section) return candidates;

  const { bodyAnchors } = section;

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
