// src/server/routes/generateDocument.ts

import { Router } from "express";
import fs from "fs";
import path from "path";
import { storageBasePath } from "../config.js";
import { logDebug } from "../../utils/logger.js";
import { transformVariables } from "../utils/transformVariables.js";
import { generateDocxFromTemplate } from "../utils/generateDocxFromTemplate.js";
import mammoth from "mammoth";

const router = Router();

/**
 * POST /api/templates/:customerId/:templateId/generate
 * Body: { variables: Record<string,string>, format: 'html' | 'docx' | 'pdf' }
 * Returns:
 *   - format=html → { previewHtml: string, metadata?: any }
 *   - format=docx/pdf → file stream
 */
router.post(
  "/templates/:customerId/:templateId/generate",
  async (req, res) => {
    const { customerId, templateId } = req.params;
    const { variables, format } = req.body as {
      variables?: Record<string, string>;
      format: "html" | "docx" | "pdf";
    };

    try {
      const templateDir = path.join(storageBasePath, customerId, "templates");

      // Detect template type by checking which file exists
      const docxPath = path.join(templateDir, `${templateId}.docx`);
      const pdfPath = path.join(templateDir, `${templateId}.pdf`);

      let templatePath: string | null = null;
      let templateType: "docx" | "pdf" | null = null;

      if (fs.existsSync(docxPath)) {
        templatePath = docxPath;
        templateType = "docx";
      } else if (fs.existsSync(pdfPath)) {
        templatePath = pdfPath;
        templateType = "pdf";
      }

      if (!templatePath || !templateType) {
        return res
          .status(404)
          .json({ success: false, error: "Template not found" });
      }

      logDebug("generateDocument.start", {
        customerId,
        templateId,
        templateType,
        format,
        variableCount: variables ? Object.keys(variables).length : 0,
      });

      // Debug: dump variables before substitution
      if (!variables) {
        logDebug("generateDocument.variables", {
          message: "variables is null/undefined",
        });
      } else {
        logDebug("generateDocument.variables", {
          keys: Object.keys(variables),
          sampleEntries: Object.entries(variables).slice(0, 10),
        });
      }

      // For DOCX templates, run substitution
      let mergedBuffer: Buffer | null = null;
      if (templateType === "docx") {
        const templateBuffer = fs.readFileSync(templatePath);
        mergedBuffer = generateDocxFromTemplate(
          templateBuffer,
          transformVariables(variables || {})
        );
      }

      // Handle downloads
      if (format === "docx" && templateType === "docx") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${templateId}.docx"`
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        return res.send(mergedBuffer);
      }

      if (format === "pdf") {
        if (templateType === "pdf") {
          // Stream static PDF template
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${templateId}.pdf"`
          );
          res.setHeader("Content-Type", "application/pdf");
          return fs.createReadStream(templatePath).pipe(res);
        }
        // TODO: integrate DOCX→PDF conversion
        return res.status(501).json({
          success: false,
          error: "PDF generation not yet implemented for DOCX templates",
        });
      }

      // Unified HTML preview branch
      if (format === "html") {
        if (templateType === "docx") {
          const { value: html } = await mammoth.convertToHtml({
            buffer: mergedBuffer!,
          });
          return res.json({
            previewHtml: html,
            metadata: { templateId, customerId, templateType },
          });
        }
        if (templateType === "pdf") {
          // TODO: implement PDF→HTML or PDF→image preview
          return res.status(501).json({
            success: false,
            error: "HTML preview not yet supported for PDF templates",
            metadata: { templateId, customerId, templateType },
          });
        }
      }

      return res
        .status(400)
        .json({ success: false, error: "Unsupported format or template type" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        logDebug("generateDocument.error", {
          message: err.message,
          stack: err.stack,
        });
        return res
          .status(500)
          .json({ success: false, error: err.message });
      }

      if (typeof err === "object" && err !== null && "properties" in err) {
        const e = err as { message?: string; properties?: any };
        logDebug("generateDocument.templateError", {
          message: e.message,
          explanation: e.properties?.explanation,
          tag: e.properties?.xtag,
        });
        return res.status(500).json({
          success: false,
          error: e.message || "Template error",
        });
      }

      logDebug("generateDocument.unknownError", { err });
      return res
        .status(500)
        .json({ success: false, error: "Unknown error" });
    }
  }
);

export default router;
