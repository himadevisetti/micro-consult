// src/utils/pdfPlaceholderization.ts
import { PDFDocument, rgb } from "pdf-lib";
import { Candidate } from "../../types/Candidate";
import { PLACEHOLDER_KEYWORDS, PLACEHOLDER_REGEX } from "../../constants/contractKeywords.js";
import { escapeRegExp } from "../escapeRegExp.js";
import { logDebug } from "../logger.js";

export async function placeholderizePdf(
  buffer: Buffer,
  candidates: Candidate[]
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates: Candidate[] }> {
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();

  const enrichedCandidates = candidates.map((c) => {
    let placeholder: string | undefined;

    if (c.schemaField) {
      const digits = (c.schemaField.match(/\d+$/) || [])[0] ?? "";
      const base = c.schemaField.replace(/\d+$/, "").toLowerCase();
      const keyword = PLACEHOLDER_KEYWORDS[base];

      const isClause = c.isExpandable === true;
      const candidateText = isClause ? c.sourceText : c.rawValue;

      if (keyword && candidateText && !PLACEHOLDER_REGEX.test(candidateText)) {
        const tag = digits ? `${keyword}${digits}` : keyword;
        placeholder = `[[${tag}]]`;

        // For now: overlay placeholder text at the candidate’s approximate location
        // (requires you to have page + yPosition from extraction)
        const pageIndex = (c.pageNumber ?? 1) - 1;
        const page = pages[pageIndex];
        if (page) {
          page.drawText(placeholder, {
            x: 50, // TODO: map from c.yPosition / xPosition if available
            y: page.getHeight() - (c.yPosition ?? 100),
            size: 12,
            color: rgb(1, 0, 0),
          });
        }

        logDebug("placeholderizePdf.overlay", {
          field: c.schemaField,
          placeholder,
          page: c.pageNumber,
        });
      }
    }
    return { ...c, placeholder };
  });

  const placeholderBuffer = Buffer.from(await pdfDoc.save());

  return { placeholderBuffer, enrichedCandidates };
}
