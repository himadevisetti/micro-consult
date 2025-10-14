import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";

export function extractAmounts(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  const amountRegex = /\$\s?\d[\d,]*(?:\.\d{2})?/g;

  // Scope: only look under the Fees heading
  const FEES_HEADINGS = CONTRACT_KEYWORDS.headings.byField.fees.map(normalizeHeading);
  const startIdx = anchors.findIndex(a =>
    FEES_HEADINGS.includes(normalizeHeading(a.text))
  );
  if (startIdx === -1) return candidates;

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

  const bodyAnchors = anchors.slice(startIdx + 1, endIdx);

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

      const hasFeeCue =
        CONTRACT_KEYWORDS.amounts.feeContext.some(k =>
          currLower.includes(k) || prevLower.includes(k) || nextLower.includes(k)
        );
      const hasRetainerCue =
        ["retainer", "deposit", "advance"].some(k =>
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
