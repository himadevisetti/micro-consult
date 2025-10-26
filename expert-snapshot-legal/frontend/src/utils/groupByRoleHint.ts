// src/utils/groupByRoleHint.ts

import { TextAnchor } from "../types/TextAnchor";
import { ClauseBlock } from "../types/ClauseBlock";
import { logWarn, logDebug } from "../utils/logger.js";

// helper to strip out underline-only lines
function cleanLine(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^_+$/.test(trimmed)) return null; // drop underline-only
  return trimmed;
}

export function groupByRoleHint(anchors: TextAnchor[]): ClauseBlock[] {
  const grouped: Record<
    string,
    {
      heading: string;
      roleHint: string;
      texts: string[];
      spans: ClauseBlock["spans"];
      startAnchor?: TextAnchor;
    }
  > = {};
  const unassigned: TextAnchor[] = [];

  for (const a of anchors) {
    if (a.wasHeading) continue;

    if (!a.roleHint) {
      unassigned.push(a);
      continue;
    }

    const key = a.roleHint;
    if (!grouped[key]) {
      grouped[key] = {
        heading: key,
        roleHint: key,
        texts: [],
        spans: [],
        startAnchor: a,
      };
    }

    const cleaned = cleanLine(a.text);
    if (cleaned) {
      grouped[key].texts.push(cleaned);
      grouped[key].spans.push({
        text: cleaned,
        pageNumber: a.page,
        yPosition: a.y,
        offset: (a as any).offset,
        length: (a as any).length,
        polygon: Array.isArray((a as any).polygon)
          ? (a as any).polygon
          : Array.isArray((a as any).boundingBox)
            ? (a as any).boundingBox
            : undefined,
      });
    }
  }

  if (unassigned.length > 0) {
    logWarn("Found anchors without roleHint", {
      count: unassigned.length,
      examples: unassigned.slice(0, 3).map(u => ({
        page: u.page,
        y: u.y,
        text: u.text,
      })),
    });
    unassigned.forEach(u =>
      logDebug("Unassigned anchor", { page: u.page, y: u.y, text: u.text })
    );
  }

  // 🔹 Assign idx here
  return Object.values(grouped).map((block, idx) => {
    const start = block.startAnchor!;
    return {
      idx,
      heading: block.heading,
      roleHint: block.roleHint,
      body: block.texts.join(" "),
      debugBody: block.texts.join("\n"),
      pageNumber: start.page,
      yPosition: start.y,
      spans: block.spans,
      polygon: block.spans[0]?.polygon,
    };
  });
}
