// src/utils/candidates/deriveCandidatesFromRead.ts

import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { getTextAnchors } from "./getTextAnchors.js";
import { extractActors } from "../candidateExtractors/actors.js";
import { extractFeeStructure } from "../candidateExtractors/fees.js";
import { extractAmounts } from "../candidateExtractors/amounts.js";
import { extractDatesAndFilingParty } from "../candidateExtractors/dates.js";
import { extractGoverningLaw } from "../candidateExtractors/governingLaw.js";
import { extractScope } from "../candidateExtractors/scope.js";
import { extractIPRandL } from "../candidateExtractors/iprAndL.js";
import { logDebug } from "../logger.js";

const TRACE = process.env.DEBUG_TRACE === "true";

/**
 * Derive structured candidates from prebuilt-read output.
 */
export function deriveCandidatesFromRead(
  readResult: any
): { candidates: Candidate[] } {
  if (!readResult) {
    logDebug(">>> deriveCandidatesFromRead.emptyInput");
    return { candidates: [] };
  }

  // Still build anchors internally for the extractors
  const anchors: TextAnchor[] = getTextAnchors(readResult);

  // First extract all actors (partyA, partyB, inventors)
  const actorCandidates = extractActors(anchors);

  // Pull out inventor names (handles both "Inventor" and "InventorN")
  const inventorNames = actorCandidates
    .filter(c => c.schemaField && c.schemaField.toLowerCase().startsWith("inventor"))
    .map(c => c.rawValue)
    .filter(Boolean);

  // Handle ambiguous parties
  const ambiguousParties = actorCandidates.filter(
    c => c.schemaField === null && c.candidates?.includes("partyA")
  );

  let partyA =
    actorCandidates.find(c => c.schemaField?.toLowerCase() === "partya")
      ?.rawValue ?? "";
  let partyB =
    actorCandidates.find(c => c.schemaField?.toLowerCase() === "partyb")
      ?.rawValue ?? "";

  if (!partyA && ambiguousParties.length > 0) {
    partyA = ambiguousParties[0].rawValue;
  }
  if (!partyB && ambiguousParties.length > 1) {
    partyB = ambiguousParties[1].rawValue;
  }

  // Merge all candidates
  const candidates: Candidate[] = [
    ...actorCandidates,
    ...extractFeeStructure(anchors),
    ...extractAmounts(anchors),
    ...extractDatesAndFilingParty(anchors, { inventorNames, partyA, partyB }),
    ...extractGoverningLaw(anchors),
    ...extractScope(anchors),
    ...extractIPRandL(anchors, { inventorNames, partyA, partyB }),
  ];

  if (TRACE) {
    logDebug(">>> deriveCandidatesFromRead.output (sample)", {
      candidateCount: candidates.length,
      sample: candidates.slice(0, 10).map((c, i) => ({
        i,
        field: c.schemaField,
        page: c.pageNumber,
        y: c.yPosition,
        roleHint: c.roleHint ?? "",
        raw: c.rawValue,
      })),
    });
  } else {
    logDebug(`>>> deriveCandidatesFromRead.output: count=${candidates.length}`);
  }

  return { candidates };
}
