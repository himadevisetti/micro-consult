import { logDebug, logWarn } from "../../utils/logger.js";

/**
 * Debug helper: log all raw lines from prebuilt-read.
 * Only runs if DEBUG_READ_FIELDS is set in the environment.
 */
export function logAllReadFields(readResult: any) {
  if (!process.env.DEBUG_READ_FIELDS) return;

  if (!readResult) {
    logWarn("logAllReadFields: No read result");
    return;
  }

  // PDF / image path: pages[].lines populated
  if (readResult.pages?.some((p: any) => (p.lines ?? []).length > 0)) {
    readResult.pages.forEach((page: any, idx: number) => {
      logDebug(`logAllReadFields: --- Page ${idx + 1} ---`);
      (page.lines ?? []).forEach((line: any, lineIdx: number) => {
        const content = String(line.content ?? "").trim();
        const bb = Array.isArray(line.boundingBox) ? line.boundingBox
          : Array.isArray(line.polygon) ? line.polygon : undefined;
        // Always dump the raw line object once if TRACE is on
        // if (process.env.DEBUG_TRACE === "true") {
        //   logDebug(`Line[${lineIdx}] raw=${JSON.stringify(line)}`);
        // }
        logDebug(
          `Line[${lineIdx}] (page=${page.pageNumber}) "${content}"` +
          (bb ? ` bb=${JSON.stringify(bb)}` : " bb=none")
        );
      });
    });
    return;
  }

  // DOCX path: fall back to paragraphs
  if (readResult.paragraphs?.length) {
    logDebug("logAllReadFields: --- Paragraphs ---");
    readResult.paragraphs.forEach((p: any, idx: number) => {
      const page = p.boundingRegions?.[0]?.pageNumber ?? "?";
      const bb = p.boundingRegions?.[0]?.boundingBox;
      if (process.env.DEBUG_TRACE === "true") {
        logDebug(`Paragraph[${idx}] raw=${JSON.stringify(p)}`);
      }
      logDebug(
        `[p${idx}] (page ${page}) "${p.content}"` +
        (bb ? ` bb=${JSON.stringify(bb)}` : " bb=none")
      );
    });
    return;
  }

  // Fallback: just dump content
  if (readResult.content) {
    logDebug("logAllReadFields: --- Content ---");
    logDebug(readResult.content);
  } else {
    logWarn("logAllReadFields: No lines, paragraphs, or content found");
  }
}
