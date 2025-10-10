import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { PartyContext } from "../../types/PartyContext";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { parseIsoDate } from "../formatDate.js";
import { logDebug } from "../logger.js";

export function extractDatesAndFilingParty(
  anchors: TextAnchor[],
  context: PartyContext
): Candidate[] {
  const candidates: Candidate[] = [];
  const monthDateRegex = CONTRACT_KEYWORDS.dates.monthDateRegex;

  const emitDate = (
    rawDate: string,
    schemaField: "effectiveDate" | "expirationDate" | "executionDate",
    anchor: TextAnchor
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
      pageNumber: anchor.page,
      yPosition: anchor.y,
      roleHint: anchor.roleHint,
    });
    logDebug(">>> Date emitted:", { schemaField, rawDate });
  };

  // Inline dates
  for (const anchor of anchors) {
    let dm: RegExpExecArray | null;
    while ((dm = monthDateRegex.exec(anchor.text)) !== null) {
      const rawDate = dm[0];
      const lower = anchor.text.toLowerCase();

      if (CONTRACT_KEYWORDS.dates.effective.some(k => lower.includes(k))) {
        emitDate(rawDate, "effectiveDate", anchor);
      } else if (CONTRACT_KEYWORDS.dates.expiration.some(k => lower.includes(k))) {
        emitDate(rawDate, "expirationDate", anchor);
      } else if (CONTRACT_KEYWORDS.dates.execution.some(k => lower.includes(k))) {
        emitDate(rawDate, "executionDate", anchor);
      } else {
        candidates.push({
          rawValue: rawDate,
          schemaField: null,
          candidates: ["effectiveDate", "expirationDate"],
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
        });
        logDebug(">>> Ambiguous date emitted:", { rawDate });
      }
    }
  }

  // Execution date and Filing Party from signature block
  const sigStartIdx = anchors.findIndex(a => /signatures/i.test(a.text));
  const sigBlock = sigStartIdx >= 0 ? anchors.slice(sigStartIdx) : anchors.slice(-20);

  // Collect signatory lines (filter out boilerplate and dates)
  const signatories: string[] = [];
  for (let i = 0; i < sigBlock.length; i++) {
    const curr = sigBlock[i];
    const next = sigBlock[i + 1];
    const windowText = `${curr.text} ${next ? next.text : ""}`;
    const windowLower = windowText.toLowerCase();

    // Execution Date
    if (CONTRACT_KEYWORDS.dates.execution.some(k => windowLower.includes(k))) {
      const dateMatch = windowText.match(monthDateRegex);
      if (dateMatch) {
        emitDate(dateMatch[0], "executionDate", curr);
        logDebug(">>> Execution date detected in signature block:", {
          match: dateMatch[0],
        });
      }
    }

    const text = curr.text.trim();
    if (
      text &&
      !/signatures/i.test(text) &&
      !monthDateRegex.test(text) &&
      !/^in witness whereof/i.test(text)
    ) {
      signatories.push(text);
    }
  }

  // Resolve filing party (IPR&L docs)
  const { inventorNames = [], partyA, partyB } = context;
  const sigTextLower = signatories.join(" ").toLowerCase();

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
          candidates: [schemaField], // align candidates with schemaField
          pageNumber: sigBlock[0]?.page,
          yPosition: sigBlock[0]?.y,
          roleHint: "Filing Party",
        });
        logDebug("filingParty.detected.inventor", { filingParty: inv, signatories });
      });
      emitted = true;
    }
  }

  // Step 2: fall back to partyA/partyB if no inventors emitted
  if (!emitted) {
    if (partyA && sigTextLower.includes(partyA.toLowerCase())) {
      candidates.push({
        rawValue: partyA,
        schemaField: "filingParty",
        candidates: ["filingParty"], // already consistent
        pageNumber: sigBlock[0]?.page,
        yPosition: sigBlock[0]?.y,
        roleHint: "Filing Party",
      });
      logDebug("filingParty.detected.partyA", { filingParty: partyA, signatories });
      emitted = true;
    } else if (partyB && sigTextLower.includes(partyB.toLowerCase())) {
      candidates.push({
        rawValue: partyB,
        schemaField: "filingParty",
        candidates: ["filingParty"], // already consistent
        pageNumber: sigBlock[0]?.page,
        yPosition: sigBlock[0]?.y,
        roleHint: "Filing Party",
      });
      logDebug("filingParty.detected.partyB", { filingParty: partyB, signatories });
      emitted = true;
    }
  }

  // Step 3: log unresolved
  if (!emitted) {
    logDebug("filingParty.unresolved", {
      signatories,
      inventorNames,
      partyA,
      partyB,
    });
  }

  return candidates;
}
