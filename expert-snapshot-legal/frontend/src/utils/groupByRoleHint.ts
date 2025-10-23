// src/utils/groupByRoleHint.ts

import { TextAnchor } from "../types/TextAnchor";
import { ClauseBlock } from "../types/ClauseBlock";
import { logWarn, logDebug } from "../utils/logger.js";

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

    grouped[key].texts.push(a.text.trim());
    grouped[key].spans.push({
      text: a.text.trim(),
      pageNumber: a.page,
      yPosition: a.y,
      polygon: (a as any).polygon ?? (a as any).boundingBox,
    });
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

  return Object.values(grouped).map(block => {
    const start = block.startAnchor!;
    return {
      heading: block.heading,
      roleHint: block.roleHint,
      body: block.texts.join("\n"),
      pageNumber: start.page,
      yPosition: start.y,
      spans: block.spans,
    };
  });
}
