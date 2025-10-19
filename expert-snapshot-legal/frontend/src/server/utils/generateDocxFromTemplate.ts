// src/server/utils/generateDocxFromTemplate.ts
//
// Utility to generate a DOCX from a template using Docxtemplater.

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { logDebug } from "../../utils/logger.js";

export function generateDocxFromTemplate(
  templateBuffer: Buffer,
  data: Record<string, any>
): Buffer {
  const zip = new PizZip(templateBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "[[", end: "]]" },
  });

  // Optional: log tags before rendering for traceability
  try {
    logDebug("generateDocxFromTemplate.beforeRender", {
      tags: (doc as any).getTags?.(),
    });
  } catch (e) {
    logDebug("generateDocxFromTemplate.beforeRenderError", {
      message: (e as Error).message,
    });
  }

  // Render with provided data
  doc.render(data);

  // Optional: log after rendering for traceability
  try {
    logDebug("generateDocxFromTemplate.afterRender", {
      textPreview: (doc as any).getFullText?.()?.slice(0, 200), // preview only
    });
  } catch (e) {
    logDebug("generateDocxFromTemplate.afterRenderError", {
      message: (e as Error).message,
    });
  }

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}
