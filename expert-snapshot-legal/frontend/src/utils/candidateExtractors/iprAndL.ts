// iprAndL.ts
import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

export function extractIPRandL(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // IP Type
  for (const anchor of anchors) {
    const lower = anchor.text.toLowerCase();
    const type = CONTRACT_KEYWORDS.ip.typeCues.find(k => lower.includes(k));
    if (type) {
      candidates.push({
        rawValue: type,
        schemaField: "ipType",
        candidates: ["ipType"],
        pageNumber: anchor.page,
        yPosition: anchor.y,
        roleHint: "IP Type",
      });
      logDebug(">>> IP Type detected:", { type });
    }
  }

  // License Scope
  for (const anchor of anchors) {
    const lower = anchor.text.toLowerCase();
    const scope = CONTRACT_KEYWORDS.ip.licenseScopeCues.find(k => lower.includes(k));
    if (scope) {
      candidates.push({
        rawValue: scope,
        schemaField: "licenseScope",
        candidates: ["licenseScope"],
        pageNumber: anchor.page,
        yPosition: anchor.y,
        roleHint: "License Scope",
      });
      logDebug(">>> License Scope detected:", { scope });
    }
  }

  // Invention Assignment
  for (const anchor of anchors) {
    const assignMatch = anchor.text.match(/assigns all rights.* to (.+)/i);
    if (assignMatch) {
      candidates.push({
        rawValue: assignMatch[1].trim(),
        schemaField: "inventionAssignment",
        candidates: ["inventionAssignment"],
        pageNumber: anchor.page,
        yPosition: anchor.y,
        roleHint: "Assignee",
      });
      logDebug(">>> Invention Assignment detected:", { inventionAssignment: assignMatch[1] });
    }
  }

  // Note: no ipDescription here — handled by extractScopeOfRepresentation

  return candidates;
}
