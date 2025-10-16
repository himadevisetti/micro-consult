import { logDebug, logWarn } from "../../utils/logger";

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
      (page.lines ?? []).forEach((line: any) => {
        logDebug(`Line: "${line.content}"`);
      });
    });
    return;
  }

  // DOCX path: fall back to paragraphs
  if (readResult.paragraphs?.length) {
    logDebug("logAllReadFields: --- Paragraphs ---");
    readResult.paragraphs.forEach((p: any, idx: number) => {
      const page = p.boundingRegions?.[0]?.pageNumber ?? "?";
      logDebug(`[p${idx}] (page ${page}) "${p.content}"`);
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

