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

  const SIGNATURE_HEADINGS = CONTRACT_KEYWORDS.headings.byField.signatures.map(normalizeHeading);
  const IGNORE_SIGNATURE_LINES = CONTRACT_KEYWORDS.signatures.ignore.map(normalizeHeading);

  const emitDate = (
    rawDate: string,
    schemaField: "effectiveDate" | "expirationDate" | "executionDate",
    block: ClauseBlock
  ) => {
    if (candidates.some(c => c.schemaField === schemaField && c.rawValue === rawDate)) {
      return;
    }
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
      sourceText: block.body,
      blockIdx: block.idx, // 🔹 anchor to owning block
    });
    logDebug(">>> date.emitted", {
      schemaField,
      rawDate,
      page: block.pageNumber,
      y: block.yPosition,
      roleHint: block.roleHint,
      sourcePreview: block.body.slice(0, 120),
    });
  };

  // --- Inline dates across all blocks (skip signature block) ---
  for (const block of blocks) {
    if (headingMatches(block.roleHint, SIGNATURE_HEADINGS)) {
      continue;
    }
    const lines = block.body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      let dm: RegExpExecArray | null;
      while ((dm = monthDateRegex.exec(line)) !== null) {
        const rawDate = dm[0];
        const lower = line.toLowerCase();

        if (CONTRACT_KEYWORDS.dates.effective.some(k => lower.includes(k))) {
          emitDate(rawDate, "effectiveDate", block);
        } else if (CONTRACT_KEYWORDS.dates.expiration.some(k => lower.includes(k))) {
          emitDate(rawDate, "expirationDate", block);
        } else if (CONTRACT_KEYWORDS.dates.execution.some(k => lower.includes(k))) {
          emitDate(rawDate, "executionDate", block);
        } else {
          candidates.push({
            rawValue: rawDate,
            schemaField: null,
            candidates: ["effectiveDate", "expirationDate"],
            pageNumber: block.pageNumber,
            yPosition: block.yPosition,
            roleHint: block.roleHint,
            sourceText: block.body,
            blockIdx: block.idx, // 🔹 anchor to owning block
          });
          logDebug(">>> date.ambiguous", {
            rawDate,
            page: block.pageNumber,
            y: block.yPosition,
            roleHint: block.roleHint,
            sourcePreview: block.body.slice(0, 120),
          });
        }
      }
    }
  }

  // --- Signature block detection ---
  const sigBlock =
    blocks.find(b => b.roleHint && headingMatches(b.roleHint, SIGNATURE_HEADINGS)) ??
    blocks[blocks.length - 1];

  const signatoryCandidates: Candidate[] = [];

  for (const span of sigBlock.spans ?? []) {
    const text = span.text.trim();
    if (!text) continue;

    const lower = text.toLowerCase();

    // Execution Date line
    if (CONTRACT_KEYWORDS.dates.execution.some(k => lower.includes(k))) {
      const dateMatch = text.match(monthDateRegex);
      if (dateMatch) {
        const iso = parseIsoDate(dateMatch[0]);
        candidates.push({
          rawValue: dateMatch[0],
          schemaField: "executionDate",
          candidates: ["executionDate"],
          normalized: iso,
          displayValue: iso
            ? new Date(dateMatch[0]).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            : dateMatch[0],
          pageNumber: span.pageNumber,
          yPosition: span.yPosition,
          roleHint: "Signatures",
          sourceText: text,
          isExpandable: false,
          blockIdx: sigBlock.idx, // 🔹 anchor to signature block
        });
        logDebug(">>> executionDate.fromSignature", {
          rawDate: dateMatch[0],
          sourcePreview: text,
        });
      }
      continue;
    }

    // Signatory lines
    if (
      !headingMatches(text, SIGNATURE_HEADINGS) &&
      !monthDateRegex.test(text) &&
      !IGNORE_SIGNATURE_LINES.includes(normalizeHeading(text)) &&
      !/^_+$/.test(text)
    ) {
      signatoryCandidates.push({
        rawValue: text,
        schemaField: "",
        candidates: [],
        pageNumber: span.pageNumber,
        yPosition: span.yPosition,
        roleHint: "Signatory",
        sourceText: text,
        isExpandable: false,
        blockIdx: sigBlock.idx, // 🔹 anchor to signature block
      });
    }
  }

  // --- Filing Party resolution ---
  // ⛔️ Do NOT assign blockIdx here — these are global, not clause‑anchored
  const { inventorNames = [], partyA, partyB } = context;
  const sigTextLower = signatoryCandidates.map(c => c.rawValue).join(" ").toLowerCase();

  let emitted = false;

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
          pageNumber: undefined,
          yPosition: undefined,
          sourceText: undefined,
        });
        logDebug(">>> filingParty.detected", { schemaField, rawValue: inv });
      });
      emitted = true;
    }
  }

  if (!emitted) {
    if (partyA && sigTextLower.includes(partyA.toLowerCase())) {
      candidates.push({
        rawValue: partyA,
        schemaField: "filingParty",
        candidates: ["filingParty"],
        roleHint: "Filing Party",
        pageNumber: undefined,
        yPosition: undefined,
        sourceText: undefined,
      });
      emitted = true;
    } else if (partyB && sigTextLower.includes(partyB.toLowerCase())) {
      candidates.push({
        rawValue: partyB,
        schemaField: "filingParty",
        candidates: ["filingParty"],
        roleHint: "Filing Party",
        pageNumber: undefined,
        yPosition: undefined,
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

  // Emit signatory candidates
  signatoryCandidates.forEach((c, idx) => {
    const schemaField =
      signatoryCandidates.length > 1 ? `signatory${idx + 1}` : "signatory";
    candidates.push({
      ...c,
      schemaField,
      candidates: [schemaField],
      blockIdx: sigBlock.idx, // 🔹 anchor to signature block
    });
    logDebug(">>> signatory.detected", {
      schemaField,
      rawValue: c.rawValue,
      page: c.pageNumber,
      y: c.yPosition,
      sourcePreview: c.sourceText?.slice(0, 120),
    });
  });

  return candidates;
}
