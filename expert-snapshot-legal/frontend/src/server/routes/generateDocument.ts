// src/server/routes/generateDocument.ts
//
// Route for generating documents from templates.
// Supports HTML preview, DOCX download, and (future) PDF conversion.

import { Router } from "express";
import fs from "fs";
import path from "path";
import { storageBasePath } from "../config.js";
import { logDebug } from "../../utils/logger.js";
import { transformVariables } from '../utils/transformVariables.js';
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
      const docxPath = path.join(templateDir, `${templateId}.docx`);

      if (!fs.existsSync(docxPath)) {
        return res
          .status(404)
          .json({ success: false, error: "Template not found" });
      }

      logDebug("generateDocument.start", {
        customerId,
        templateId,
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

      // Load template and run substitution
      const templateBuffer = fs.readFileSync(docxPath);
      const mergedBuffer = generateDocxFromTemplate(
        templateBuffer,
        transformVariables(variables || {})
      );

      if (format === "docx") {
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
        // TODO: integrate DOCX→PDF conversion here
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${templateId}.pdf"`
        );
        res.setHeader("Content-Type", "application/pdf");
        return res.status(501).json({
          success: false,
          error: "PDF generation not yet implemented",
        });
      }

      if (format === "html") {
        // Convert merged DOCX buffer to HTML for preview
        const { value: html } = await mammoth.convertToHtml({
          buffer: mergedBuffer,
        });
        return res.json({
          previewHtml: html,
          metadata: { templateId, customerId },
        });
      }

      return res
        .status(400)
        .json({ success: false, error: "Unsupported format" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Standard JS error
        logDebug("generateDocument.error", {
          message: err.message,
          stack: err.stack,
        });
        return res
          .status(500)
          .json({ success: false, error: err.message });
      }

      // Docxtemplater sometimes throws objects with `properties`
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

      // Fallback
      logDebug("generateDocument.unknownError", { err });
      return res
        .status(500)
        .json({ success: false, error: "Unknown error" });
    }
  }
);

export default router;
