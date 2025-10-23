// src/utils/candidates/deriveCandidatesFromRead.ts

import { Candidate } from "../../types/Candidate";
import { getTextAnchors } from "./getTextAnchors.js";
import { extractActors } from "../candidateExtractors/actors.js";
import { extractFees } from "../candidateExtractors/fees.js";
import { extractDatesAndFilingParty } from "../candidateExtractors/dates.js";
import { extractGoverningLaw } from "../candidateExtractors/governingLaw.js";
import { extractScope } from "../candidateExtractors/scope.js";
import { extractIPType } from "../candidateExtractors/ipType.js";
import { extractLicenseScope } from "../candidateExtractors/licenseScope.js";
import { extractInventionAssignment } from "../candidateExtractors/inventionAssignment.js";
import { logDebug } from "../logger.js";

const TRACE = process.env.DEBUG_TRACE === "true";

export function deriveCandidatesFromRead(
  readResult: any
): { candidates: Candidate[] } {
  if (!readResult) {
    logDebug(">>> deriveCandidatesFromRead.emptyInput");
    return { candidates: [] };
  }

  const clauseBlocks = getTextAnchors(readResult);

  const actorCandidates = extractActors(clauseBlocks);

  const inventorNames = actorCandidates
    .filter(c => c.schemaField && c.schemaField.toLowerCase().startsWith("inventor"))
    .map(c => c.rawValue)
    .filter(Boolean);

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

  const candidates: Candidate[] = [
    ...actorCandidates,
    ...extractFees(clauseBlocks),
    ...extractDatesAndFilingParty(clauseBlocks, { inventorNames, partyA, partyB }),
    ...extractGoverningLaw(clauseBlocks),
    ...extractScope(clauseBlocks),
    ...extractIPType(clauseBlocks),
    ...extractLicenseScope(clauseBlocks),
    ...extractInventionAssignment(clauseBlocks, { inventorNames, partyA, partyB }),
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
