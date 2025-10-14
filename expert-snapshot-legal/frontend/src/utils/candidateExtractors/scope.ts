import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { normalizeHeading } from "../normalizeValue.js";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

function firstSentence(text: string): string {
  return text.match(/[^.?!]+[.?!]/)?.[0]?.trim() ?? text;
}

export function extractScope(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading variants
  const SCOPE_HEADINGS = CONTRACT_KEYWORDS.headings.byField.scope.map(normalizeHeading);
  const ALL_HEADINGS = Object.values(CONTRACT_KEYWORDS.headings.byField)
    .flat()
    .map(normalizeHeading);

  // Find the first anchor that matches a scope heading
  const headingIndex = anchors.findIndex(a =>
    SCOPE_HEADINGS.includes(normalizeHeading(a.text))
  );

  if (headingIndex >= 0) {
    // Collect subsequent anchors until the next section heading
    const bodyAnchors: TextAnchor[] = [];
    for (let i = headingIndex + 1; i < anchors.length; i++) {
      const text = anchors[i].text.trim();
      if (ALL_HEADINGS.includes(normalizeHeading(text))) {
        break; // stop at the next recognized heading
      }
      bodyAnchors.push(anchors[i]);
    }

    if (bodyAnchors.length > 0) {
      // Concatenate for full display (UI expands to this)
      const fullScope = bodyAnchors
        .map(a => a.text.trim())
        .join(" ") // ensure spacing between sentences
        .replace(/\s+/g, " ")
        .trim();

      // Always placeholderize the first anchor of the block
      const firstAnchor = bodyAnchors[0];
      const matchText = firstAnchor.text.trim();

      // Preview is the first sentence of the full block
      const preview = firstSentence(fullScope);

      candidates.push({
        rawValue: matchText,        // exact anchor text for placeholderization
        displayValue: preview,      // short preview for UI
        schemaField: "scope",
        candidates: ["scope"],
        pageNumber: firstAnchor.page,
        yPosition: firstAnchor.y,
        roleHint: firstAnchor.roleHint,
        sourceText: fullScope,      // full block for "View full/Hide"
        isExpandable: true,         // always true for clause-type fields
      });

      logDebug(">>> scope.detected", {
        previewLength: preview.length,
        fullLength: fullScope.length,
        isExpandable: fullScope.length > preview.length,
        page: firstAnchor.page,
        y: firstAnchor.y,
        roleHint: firstAnchor.roleHint,
        preview,
        rawValue: matchText,
        sourcePreview: fullScope.slice(0, 160),
      });
    } else {
      logDebug(">>> scope.notEmitted", {
        reason: "No body text found after heading",
      });
    }
  } else {
    logDebug(">>> scope.notEmitted", {
      reason: "No scope heading found",
    });
  }

  return candidates;
}
