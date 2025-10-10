import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { PartyContext } from "../../types/PartyContext";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

export function extractIPRandL(
  anchors: TextAnchor[],
  context: PartyContext
): Candidate[] {
  const candidates: Candidate[] = [];

  // --- IP Type ---
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
      logDebug("ip.typeDetected", { type, page: anchor.page, y: anchor.y });
    }
  }

  // --- License Scope ---
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
      logDebug("ip.licenseScopeDetected", { scope, page: anchor.page, y: anchor.y });
    }
  }

  // --- Invention Assignment (global priority: Step1 → Step2 → Step3) ---
  type Hit = {
    assignee: string;
    page: number;
    y: number;
    text: string;
    roleHint?: string;
  };

  const iaAnchors = anchors.filter(a =>
    a.roleHint?.toLowerCase().includes("invention assignment")
  );

  const step1Hits: Hit[] = [];
  const step2Hits: Hit[] = [];
  const step3Hits: Hit[] = [];

  // Step 1
  for (const anchor of iaAnchors) {
    const text = anchor.text.trim();
    const lower = text.toLowerCase();

    const hits: string[] = [];
    if (context.partyA && lower.includes(context.partyA.toLowerCase())) hits.push(context.partyA);
    if (context.partyB && lower.includes(context.partyB.toLowerCase())) hits.push(context.partyB);
    if (Array.isArray(context.inventorNames)) {
      for (const inv of context.inventorNames) {
        if (inv && lower.includes(inv.toLowerCase())) hits.push(inv);
      }
    }

    hits.forEach(a =>
      step1Hits.push({
        assignee: a,
        page: anchor.page,
        y: anchor.y,
        text,
        roleHint: anchor.roleHint,
      })
    );
  }
  if (step1Hits.length) {
    logDebug("ip.iaStep1.fired", { count: step1Hits.length });
  }

  // Step 2
  if (step1Hits.length === 0) {
    for (const anchor of iaAnchors) {
      const text = anchor.text.trim();
      const lower = text.toLowerCase();

      const foundLabels = CONTRACT_KEYWORDS.parties.roleLabels.filter(label =>
        lower.includes(label)
      );

      let chosenRole: string | undefined;
      let rawRoleLabel: string | undefined;

      const toIdx = lower.indexOf("to ");
      if (toIdx >= 0) {
        const afterTo = lower.slice(toIdx);
        const match = foundLabels.find(label => afterTo.includes(label));
        if (match) {
          chosenRole = match;
          const regex = new RegExp(`\\b(?:the\\s+)?${match}[A-Za-z()]*`, "i");
          const rawMatch = regex.exec(text);
          if (rawMatch) rawRoleLabel = rawMatch[0];
        }
      }

      if (!chosenRole && foundLabels.length > 0) {
        chosenRole = foundLabels[0];
        const regex = new RegExp(`\\b(?:the\\s+)?${chosenRole}[A-Za-z()]*`, "i");
        const rawMatch = regex.exec(text);
        if (rawMatch) rawRoleLabel = rawMatch[0];
      }

      if (chosenRole) {
        let mapped: string | null = null;
        if (/client|company/.test(chosenRole) && context.partyA) mapped = context.partyA;
        else if (/provider|consultant|firm/.test(chosenRole) && context.partyB) mapped = context.partyB;

        step2Hits.push({
          assignee: mapped ?? (rawRoleLabel ?? chosenRole),
          page: anchor.page,
          y: anchor.y,
          text,
          roleHint: anchor.roleHint,
        });
      }
    }
    if (step2Hits.length) {
      logDebug("ip.iaStep2.fired", { count: step2Hits.length });
    }
  }

  // Step 3
  if (step1Hits.length === 0 && step2Hits.length === 0) {
    for (const anchor of iaAnchors) {
      const text = anchor.text.trim();
      const lower = text.toLowerCase();

      const cuesHit = CONTRACT_KEYWORDS.ip.inventionAssignmentCues.some(k => lower.includes(k));
      if (cuesHit) {
        const m = text.match(/\bto\s+([A-Z][A-Za-z0-9&.,\-()'\s]+)/);
        if (m) {
          const raw = m[1].replace(/\b(effective|dated|commencing|during|pursuant)\b.*$/i, "").trim();
          if (raw) {
            const targets = raw.split(/,| and /i).map(s => s.trim()).filter(Boolean);
            targets.forEach(a =>
              step3Hits.push({
                assignee: a,
                page: anchor.page,
                y: anchor.y,
                text,
                roleHint: anchor.roleHint,
              })
            );
          }
        }
      }
    }
    if (step3Hits.length) {
      logDebug("ip.iaStep3.fired", { count: step3Hits.length });
    } else {
      logDebug("ip.iaStep3.noToCapture", { anchors: iaAnchors.length });
    }
  }

  // Step 5: choose, dedupe, emit
  const chosen = step1Hits.length ? step1Hits : (step2Hits.length ? step2Hits : step3Hits);

  const seen = new Set<string>();
  const uniqueHits: Hit[] = [];
  for (const h of chosen) {
    const key = h.assignee.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueHits.push(h);
  }

  uniqueHits.forEach((h, idx) => {
    const schemaField =
      uniqueHits.length > 1
        ? `inventionAssignment${idx + 1}`
        : "inventionAssignment";

    candidates.push({
      rawValue: h.assignee,
      schemaField,
      candidates: [schemaField], // align candidates with schemaField
      pageNumber: h.page,
      yPosition: h.y,
      roleHint: h.roleHint,
    });

    logDebug("ip.inventionAssignmentDetected", {
      assignee: h.assignee,
      schemaField,
      page: h.page,
      y: h.y,
    });
  });

  return candidates;
}
