import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";
import { collectSectionBody } from "../sectionUtils.js";

export function extractAmounts(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];
  const amountRegex = /\$\s?\d[\d,]*(?:\.\d{2})?/g;

  // Normalized heading list for Fees
  const FEES_HEADINGS = CONTRACT_KEYWORDS.headings.byField.fees.map(normalizeHeading);

  // Use helper to collect section body
  const section = collectSectionBody(anchors, FEES_HEADINGS);
  if (!section) {
    logDebug(">>> amounts.notEmitted", { reason: "No Fees heading found" });
    return candidates;
  }
  logDebug(">>> amounts.sectionFound", {
    start: anchors[section.startIdx]?.text,
    bodyCount: section.bodyAnchors.length,
  });

  const { bodyAnchors } = section;

  for (let i = 0; i < bodyAnchors.length; i++) {
    const curr = bodyAnchors[i].text;
    const prev = bodyAnchors[i - 1]?.text ?? "";
    const next = bodyAnchors[i + 1]?.text ?? "";

    const currLower = curr.toLowerCase();
    const prevLower = prev.toLowerCase();
    const nextLower = next.toLowerCase();

    let m: RegExpExecArray | null;
    while ((m = amountRegex.exec(curr)) !== null) {
      const raw = m[0];

      const hasFeeCue = CONTRACT_KEYWORDS.amounts.feeContext.some(k =>
        currLower.includes(k) || prevLower.includes(k) || nextLower.includes(k)
      );
      const hasRetainerCue = ["retainer", "deposit", "advance"].some(k =>
        currLower.includes(k) || prevLower.includes(k) || nextLower.includes(k)
      );

      let schemaField: "feeAmount" | "retainerAmount" | null = null;
      let options: string[] = [];

      if (hasFeeCue && !hasRetainerCue) {
        schemaField = "feeAmount";
        options = ["feeAmount"];
      } else if (hasRetainerCue && !hasFeeCue) {
        schemaField = "retainerAmount";
        options = ["retainerAmount"];
      } else {
        schemaField = null;
        options = ["feeAmount", "retainerAmount"];
      }

      candidates.push({
        rawValue: raw,
        schemaField,
        candidates: options,
        pageNumber: bodyAnchors[i].page,
        yPosition: bodyAnchors[i].y,
        roleHint: bodyAnchors[i].roleHint,
        sourceText: curr,
      });

      logDebug(">>> amount.detected", {
        raw,
        schemaField,
        options,
        page: bodyAnchors[i].page,
        y: bodyAnchors[i].y,
        sourcePreview: curr.slice(0, 80),
      });
    }
  }

  return candidates;
}
