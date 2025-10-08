import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

export function extractAmounts(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  const amountRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const isFeeCue = (t: string) =>
    CONTRACT_KEYWORDS.amounts.feeContext.some(k => t.includes(k));
  const isRetainerCue = (t: string) =>
    CONTRACT_KEYWORDS.amounts.retainerCues.some(k => t.includes(k));

  let seenFee = false;
  let seenRetainer = false;

  for (let i = 0; i < anchors.length; i++) {
    const curr = anchors[i].text;
    const prev = anchors[i - 1]?.text ?? "";
    const next = anchors[i + 1]?.text ?? "";

    const currLower = curr.toLowerCase();
    const prevLower = prev.toLowerCase();
    const nextLower = next.toLowerCase();

    let m: RegExpExecArray | null;
    while ((m = amountRegex.exec(curr)) !== null) {
      const raw = `$${m[1]}`;

      const hasFeeCue =
        isFeeCue(currLower) || isFeeCue(prevLower) || isFeeCue(nextLower);
      const hasRetainerCue =
        isRetainerCue(currLower) || isRetainerCue(prevLower) || isRetainerCue(nextLower);

      let schemaField: "feeAmount" | "retainerAmount" | null = null;
      let options: string[] = [];

      if (hasFeeCue && !hasRetainerCue) {
        schemaField = "feeAmount";
        options = ["feeAmount"];
        seenFee = true;
      } else if (hasRetainerCue && !hasFeeCue) {
        schemaField = "retainerAmount";
        options = ["retainerAmount"];
        seenRetainer = true;
      } else {
        schemaField = null;
        options = ["feeAmount", "retainerAmount"];
        if (seenFee && !seenRetainer) {
          options = ["retainerAmount"];
        } else if (seenRetainer && !seenFee) {
          options = ["feeAmount"];
        }
      }

      candidates.push({
        rawValue: raw,
        schemaField,
        candidates: options,
        pageNumber: anchors[i].page,
        yPosition: anchors[i].y,
        roleHint: anchors[i].roleHint,
      });

      logDebug(">>> Amount detected:", { raw, schemaField, options });
    }
  }

  return candidates;
}

