// src/utils/logClauseBlocks.ts

import { ClauseBlock } from "../types/ClauseBlock";
import { logDebug } from "./logger.js";

export function logClauseBlocks(clauseBlocks: ClauseBlock[], branch: string) {
  logDebug(`>>> clauseBlocks (${branch})`, { count: clauseBlocks.length });
  clauseBlocks.forEach((block, idx) => {
    // expand polygons for readability
    const polygons = block.spans
      .map(s => s.polygon)
      .filter(Boolean)
      .slice(0, 1) // just show first span’s polygon for brevity
      .map(poly => JSON.stringify(poly));

    // log the first few spans in detail
    const spanSamples = block.spans.slice(0, 3).map((s, i) => ({
      i,
      textPreview: s.text?.slice(0, 80),
      page: s.pageNumber,
      y: s.yPosition,
      offset: s.offset,
      length: s.length,
      polygon: s.polygon ? JSON.stringify(s.polygon) : undefined,
    }));

    logDebug("ClauseBlock", {
      idx,
      heading: block.heading,
      roleHint: block.roleHint,
      page: block.pageNumber,
      y: block.yPosition,
      bodyPreview: block.body.slice(0, 120),
      spanCount: block.spans.length,
      polygons,
      spanSamples,
    });
  });
}
