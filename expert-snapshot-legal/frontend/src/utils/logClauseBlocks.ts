// src/utils/logClauseBlocks.ts

import { ClauseBlock } from "../types/ClauseBlock";
import { logDebug } from "./logger.js";

export function logClauseBlocks(clauseBlocks: ClauseBlock[], branch: string) {
  logDebug(`>>> clauseBlocks (${branch})`, { count: clauseBlocks.length });
  clauseBlocks.forEach((block, idx) => {
    // log the first few spans in detail
    const spanSamples = block.spans.slice(0, 3).map((s, i) => ({
      i,
      textPreview: s.text?.slice(0, 80),
      page: s.pageNumber,
      y: s.yPosition,
      offset: s.offset,
      length: s.length,
    }));

    logDebug("ClauseBlock", {
      idx,
      heading: block.heading,
      roleHint: block.roleHint,
      page: block.pageNumber,
      y: block.yPosition,
      bodyPreview: block.body.slice(0, 120),
      spanCount: block.spans.length,
      spanSamples,
    });
  });
}
