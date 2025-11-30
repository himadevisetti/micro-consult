// src/utils/templateNameUtils.ts

export type TemplateInfo = {
  id: string;
  name: string;
  hasManifest: boolean;
};

/**
 * Format a template's raw filename into a user‑friendly display name.
 * - Strips .docx/.pdf extensions
 * - Preserves meaningful suffixes (_draft, _final, dates, IA‑Test, etc.)
 * - If both DOCX and PDF exist for the same base, appends (DOCX)/(PDF)
 */
export function formatTemplateName(
  templateName: string,
  allTemplates: TemplateInfo[]
): string {
  // Strip extension
  let base = templateName.replace(/\.(docx|pdf)$/i, "");

  // Strip -template suffix if present
  base = base.replace(/-template$/i, "");

  // Detect format
  const isDocx = /\.docx$/i.test(templateName);
  const isPdf = /\.pdf$/i.test(templateName);

  // Normalize base for comparison
  const baseKey = base.toLowerCase();

  // Check if both formats exist for this base
  const hasDocx = allTemplates.some(
    (t) =>
      t.name.toLowerCase().replace(/\.(docx|pdf)$/i, "").replace(/-template$/i, "") === baseKey &&
      /\.docx$/i.test(t.name)
  );
  const hasPdf = allTemplates.some(
    (t) =>
      t.name.toLowerCase().replace(/\.(docx|pdf)$/i, "").replace(/-template$/i, "") === baseKey &&
      /\.pdf$/i.test(t.name)
  );

  let suffix = "";
  if (hasDocx && hasPdf) {
    suffix = isDocx ? " (DOCX)" : " (PDF)";
  }

  return base + suffix;
}
