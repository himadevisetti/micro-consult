// src/utils/logClauseBlocks.ts

import { ClauseBlock } from "../types/ClauseBlock";
import { logDebug } from "./logger.js";

export function logClauseBlocks(clauseBlocks: ClauseBlock[], branch: string) {
  logDebug(`>>> clauseBlocks (${branch})`, { count: clauseBlocks.length });
  clauseBlocks.forEach((block, idx) => {
    logDebug("ClauseBlock", {
      idx,
      heading: block.heading,
      roleHint: block.roleHint,
      page: block.pageNumber,
      y: block.yPosition,
      bodyPreview: block.body,
      // bodyPreview: block.body.slice(0, 80),
    });
  });
}

