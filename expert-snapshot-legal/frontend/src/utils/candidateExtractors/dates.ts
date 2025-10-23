// src/utils/candidateExtractors/dates.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { PartyContext } from "../../types/PartyContext";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { parseIsoDate } from "../formatDate.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";
import { headingMatches } from "../headingMatches.js";

export function extractDatesAndFilingParty(
  blocks: ClauseBlock[],
  context: PartyContext
): Candidate[] {
  const candidates: Candidate[] = [];
  const monthDateRegex = CONTRACT_KEYWORDS.dates.monthDateRegex;

  const emitDate = (
    rawDate: string,
    schemaField: "effectiveDate" | "expirationDate" | "executionDate",
    block: ClauseBlock,
    sourceText: string
  ) => {
    const iso = parseIsoDate(rawDate);
    candidates.push({
      rawValue: rawDate,
      schemaField,
      candidates: [schemaField],
      normalized: iso,
      displayValue: iso
        ? new Date(rawDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        : rawDate,
      pageNumber: block.pageNumber,
      yPosition: block.yPosition,
      roleHint: block.roleHint,
      sourceText,
    });
    logDebug(">>> date.emitted", {
      schemaField,
      rawDate,
      page: block.pageNumber,
      y: block.yPosition,
      sourcePreview: sourceText.slice(0, 80),
    });
  };

  // --- Inline dates across all blocks ---
  for (const block of blocks) {
    const lines = block.body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      let dm: RegExpExecArray | null;
      while ((dm = monthDateRegex.exec(line)) !== null) {
        const rawDate = dm[0];
        const lower = line.toLowerCase();

        if (CONTRACT_KEYWORDS.dates.effective.some(k => lower.includes(k))) {
          emitDate(rawDate, "effectiveDate", block, line);
        } else if (CONTRACT_KEYWORDS.dates.expiration.some(k => lower.includes(k))) {
          emitDate(rawDate, "expirationDate", block, line);
        } else if (CONTRACT_KEYWORDS.dates.execution.some(k => lower.includes(k))) {
          emitDate(rawDate, "executionDate", block, line);
        } else {
          candidates.push({
            rawValue: rawDate,
            schemaField: null,
            candidates: ["effectiveDate", "expirationDate"],
            pageNumber: block.pageNumber,
            yPosition: block.yPosition,
            roleHint: block.roleHint,
            sourceText: line,
          });
          logDebug(">>> date.ambiguous", {
            rawDate,
            page: block.pageNumber,
            y: block.yPosition,
            sourcePreview: line.slice(0, 80),
          });
        }
      }
    }
  }

  // --- Signature block detection ---
  const SIGNATURE_HEADINGS = CONTRACT_KEYWORDS.headings.byField.signatures.map(normalizeHeading);
  const IGNORE_SIGNATURE_LINES = CONTRACT_KEYWORDS.signatures.ignore.map(normalizeHeading);

  const sigBlock =
    blocks.find(b => b.roleHint && headingMatches(b.roleHint, SIGNATURE_HEADINGS)) ??
    blocks[blocks.length - 1]; // fallback to last block

  const signatoryLines: string[] = sigBlock.body
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const signatoryCandidates: Candidate[] = [];

  for (let i = 0; i < signatoryLines.length; i++) {
    const curr = signatoryLines[i];
    const next = signatoryLines[i + 1] ?? "";
    const windowText = `${curr} ${next}`;
    const windowLower = windowText.toLowerCase();

    // Execution Date inside signature block
    if (CONTRACT_KEYWORDS.dates.execution.some(k => windowLower.includes(k))) {
      const dateMatch = windowText.match(monthDateRegex);
      if (dateMatch) {
        emitDate(dateMatch[0], "executionDate", sigBlock, curr);
      }
    }

    if (
      curr &&
      !headingMatches(curr, SIGNATURE_HEADINGS) &&
      !monthDateRegex.test(curr) &&
      !IGNORE_SIGNATURE_LINES.includes(normalizeHeading(curr)) &&
      !/^_+$/.test(curr)
    ) {
      signatoryCandidates.push({
        rawValue: curr,
        schemaField: "", // assigned below
        candidates: [],
        pageNumber: sigBlock.pageNumber,
        yPosition: sigBlock.yPosition,
        roleHint: "Signatory",
        sourceText: curr,
      });
    }
  }

  // --- Filing Party resolution ---
  const { inventorNames = [], partyA, partyB } = context;
  const sigTextLower = signatoryCandidates.map(c => c.rawValue).join(" ").toLowerCase();

  let emitted = false;

  // Step 1: inventors
  if (inventorNames.length > 0) {
    const matchedInventors = inventorNames.filter(inv =>
      sigTextLower.includes(inv.toLowerCase())
    );
    if (matchedInventors.length > 0) {
      matchedInventors.forEach((inv, idx) => {
        const schemaField =
          matchedInventors.length > 1 ? `filingParty${idx + 1}` : "filingParty";
        candidates.push({
          rawValue: inv,
          schemaField,
          candidates: [schemaField],
          roleHint: "Filing Party",
          sourceText: undefined,
        });
      });
      emitted = true;
    }
  }

  // Step 2: fall back to partyA/partyB
  if (!emitted) {
    if (partyA && sigTextLower.includes(partyA.toLowerCase())) {
      candidates.push({
        rawValue: partyA,
        schemaField: "filingParty",
        candidates: ["filingParty"],
        roleHint: "Filing Party",
        sourceText: undefined,
      });
      emitted = true;
    } else if (partyB && sigTextLower.includes(partyB.toLowerCase())) {
      candidates.push({
        rawValue: partyB,
        schemaField: "filingParty",
        candidates: ["filingParty"],
        roleHint: "Filing Party",
        sourceText: undefined,
      });
      emitted = true;
    }
  }

  if (!emitted) {
    logDebug(">>> filingParty.unresolved", {
      signatories: signatoryCandidates.map(s => s.rawValue),
      inventorNames,
      partyA,
      partyB,
    });
  }

  // Emit signatory candidates after Filing Party
  if (signatoryCandidates.length > 0) {
    signatoryCandidates.forEach((c, idx) => {
      const schemaField =
        signatoryCandidates.length > 1 ? `signatory${idx + 1}` : "signatory";
      candidates.push({
        ...c,
        schemaField,
        candidates: [schemaField],
      });
    });
  }

  return candidates;
}
