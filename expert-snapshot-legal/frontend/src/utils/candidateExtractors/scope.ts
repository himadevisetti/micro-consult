// scope.ts
import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

function firstSentence(text: string): string {
  return text.match(/[^.?!]+[.?!]/)?.[0]?.trim() ?? text;
}

export function extractScope(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Flexible heading regex: "Scope", "Scope:", "Scope of Representation", etc.
  const headingRegex = /^\s*scope(\b|:| of\b.*)?$/i;
  const headingIndex = anchors.findIndex(a => headingRegex.test(a.text.trim()));

  let fullScope = "";
  let anchorForMeta: TextAnchor | null = null;

  if (headingIndex >= 0) {
    // Collect subsequent anchors until the next section heading
    const body: string[] = [];
    for (let i = headingIndex + 1; i < anchors.length; i++) {
      const text = anchors[i].text.trim();

      // Stop at the next section heading
      if (/^\s*(client responsibilities|fees?|payment|term|duration)\b/i.test(text)) {
        break;
      }
      body.push(text);
    }
    fullScope = body.join(" ").replace(/\s+/g, " ").trim();
    anchorForMeta = anchors[headingIndex];
  } else {
    // 🔹 Fallback: look for any anchor containing scope cues
    const scopeAnchor = anchors.find(a =>
      CONTRACT_KEYWORDS.scope.cues.some(k => a.text.toLowerCase().includes(k))
    );
    if (scopeAnchor) {
      fullScope = scopeAnchor.text.trim();
      anchorForMeta = scopeAnchor;
    }
  }

  if (fullScope && anchorForMeta) {
    const preview = firstSentence(fullScope);

    candidates.push({
      rawValue: fullScope,     // full text for "View full"
      displayValue: preview,   // 1 sentence for collapsed view
      schemaField: "scope",
      candidates: ["scope"],
      pageNumber: anchorForMeta.page,
      yPosition: anchorForMeta.y,
      roleHint: anchorForMeta.roleHint,
    });

    logDebug("scope.detected", {
      preview,
      page: anchorForMeta.page,
      roleHint: anchorForMeta.roleHint,
    });
  }

  return candidates;
}
