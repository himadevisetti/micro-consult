// src/utils/candidateExtractors/inventionAssignment.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { PartyContext } from "../../types/PartyContext";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../normalizeValue.js";
import { headingMatches } from "../headingMatches.js";
import { logDebug } from "../logger.js";

type Hit = {
  assignee: string;
  page: number;
  y: number;
  text: string;
  roleHint?: string;
};

export function extractInventionAssignment(
  blocks: ClauseBlock[],
  context: PartyContext
): Candidate[] {
  const candidates: Candidate[] = [];

  // Locate invention assignment block
  const IA_HEADINGS = CONTRACT_KEYWORDS.headings.byField.inventionAssignment.map(normalizeHeading);
  const block = blocks.find(
    b => b.roleHint && headingMatches(b.roleHint, IA_HEADINGS)
  );
  if (!block) return candidates;

  const text = block.body;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const step1Hits: Hit[] = [];
  const step2Hits: Hit[] = [];
  const step3Hits: Hit[] = [];

  // Step 1: explicit party/inventor names
  for (const line of lines) {
    const lower = line.toLowerCase();
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
        page: block.pageNumber,
        y: block.yPosition,
        text: line,
        roleHint: block.roleHint,
      })
    );
  }

  // Step 2: role labels (only if step1 empty)
  if (step1Hits.length === 0) {
    for (const line of lines) {
      const lower = line.toLowerCase();
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
          const rawMatch = regex.exec(line);
          if (rawMatch) rawRoleLabel = rawMatch[0];
        }
      }

      if (!chosenRole && foundLabels.length > 0) {
        chosenRole = foundLabels[0];
        const regex = new RegExp(`\\b(?:the\\s+)?${chosenRole}[A-Za-z()]*`, "i");
        const rawMatch = regex.exec(line);
        if (rawMatch) rawRoleLabel = rawMatch[0];
      }

      if (chosenRole) {
        let mapped: string | null = null;
        if (/client|company/.test(chosenRole) && context.partyA) mapped = context.partyA;
        else if (/provider|consultant|firm/.test(chosenRole) && context.partyB) mapped = context.partyB;

        const regex = new RegExp(`\\b(?:the\\s+)?${chosenRole}[A-Za-z()]*`, "i");
        const rawMatch = regex.exec(line);

        step2Hits.push({
          assignee: mapped ?? (rawMatch ? rawMatch[0] : line),
          page: block.pageNumber,
          y: block.yPosition,
          text: line,
          roleHint: block.roleHint,
        });
      }
    }
  }

  // Step 3: fallback cues (only if step1 & step2 empty)
  if (step1Hits.length === 0 && step2Hits.length === 0) {
    for (const line of lines) {
      const lower = line.toLowerCase();
      const cuesHit = CONTRACT_KEYWORDS.ip.inventionAssignmentCues.some(k => lower.includes(k));
      if (cuesHit) {
        const m = line.match(/\bto\s+([A-Z][A-Za-z0-9&.,\-()'\s]+)/);
        if (m) {
          const raw = m[1].replace(/\b(effective|dated|commencing|during|pursuant)\b.*$/i, "").trim();
          if (raw) {
            const targets = raw.split(/,| and /i).map(s => s.trim()).filter(Boolean);
            targets.forEach(a =>
              step3Hits.push({
                assignee: a,
                page: block.pageNumber,
                y: block.yPosition,
                text: line,
                roleHint: block.roleHint,
              })
            );
          }
        }
      }
    }
  }

  // Deduplicate and emit
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
      uniqueHits.length > 1 ? `inventionAssignment${idx + 1}` : "inventionAssignment";

    candidates.push({
      rawValue: h.assignee,
      schemaField,
      candidates: [schemaField],
      pageNumber: h.page,
      yPosition: h.y,
      roleHint: h.roleHint,
      sourceText: h.text,
    });

    logDebug(">>> ip.inventionAssignmentDetected", {
      assignee: h.assignee,
      schemaField,
      page: h.page,
      y: h.y,
      sourcePreview: h.text.slice(0, 80),
    });
  });

  return candidates;
}
