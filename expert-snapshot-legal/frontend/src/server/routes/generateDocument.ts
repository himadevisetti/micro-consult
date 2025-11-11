// src/server/routes/generateDocument.ts

import { Router } from "express";
import fs from "fs";
import path from "path";
import { storageBasePath, getCustomerManifestPath } from "../config.js";
import { logDebug, logError } from "../../utils/logger.js";
import { transformVariables } from "../utils/transformVariables.js";
import { generateDocxFromTemplate } from "../utils/generateDocxFromTemplate.js";
import { convertDocxToPdf } from "../utils/convertDocxToPdf.js";
import { uploadToAzureBlob } from "../utils/uploadToAzureBlob.js";
import mammoth from "mammoth";

const router = Router();

router.post("/templates/:customerId/:templateId/generate", async (req, res) => {
  const { customerId, templateId } = req.params;
  const { variables, format } = req.body as {
    variables?: Record<string, string>;
    format: "html" | "docx" | "pdf";
  };

  try {
    const templateDir = path.join(storageBasePath, customerId, "templates");
    const docxPath = path.join(templateDir, `${templateId}.docx`);
    const pdfPath = path.join(templateDir, `${templateId}.pdf`);

    let templatePath: string | null = null;
    let templateType: "docx" | "pdf" | null = null;
    let seedType: "docx" | "pdf" | null = null;

    if (fs.existsSync(docxPath)) {
      templatePath = docxPath;
      templateType = "docx";
    } else if (fs.existsSync(pdfPath)) {
      templatePath = pdfPath;
      templateType = "pdf";
    }

    if (!templatePath || !templateType) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    const manifestDir = getCustomerManifestPath(customerId);
    const manifestPath = path.join(manifestDir, `${templateId}.manifest.json`);
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf-8"));
        seedType = manifest.seedType as "docx" | "pdf";
      } catch (err) {
        logError("generateDocument.manifestReadError", { error: String(err) });
      }
    }
    if (!seedType) {
      seedType = templateType;
    }

    logDebug("generateDocument.start", {
      customerId,
      templateId,
      templateType,
      seedType,
      format,
      variableCount: variables ? Object.keys(variables).length : 0,
    });

    if (!variables) {
      logDebug("generateDocument.variables", { message: "variables is null/undefined" });
    } else {
      logDebug("generateDocument.variables", {
        keys: Object.keys(variables),
        sampleEntries: Object.entries(variables).slice(0, 10),
      });
    }

    let mergedBuffer: Buffer | null = null;
    if (templateType === "docx") {
      const templateBuffer = fs.readFileSync(templatePath);
      mergedBuffer = generateDocxFromTemplate(
        templateBuffer,
        transformVariables(variables || {})
      );
      logDebug("generateDocument.docxMerged", { size: mergedBuffer.length });
    }

    if (format === "docx" && templateType === "docx") {
      if (!mergedBuffer) {
        logError("generateDocument.noMergedBufferForDocx");
        return res.status(500).json({
          success: false,
          error: "No merged buffer generated for DOCX export",
        });
      }

      try {
        const blobUrl = await uploadToAzureBlob(
          mergedBuffer,
          `${templateId}.docx`,
          customerId,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        logDebug("generateDocument.docxUploadedToAzure", { blobUrl });
      } catch (err) {
        logError("generateDocument.docxUploadError", {
          message: err instanceof Error ? err.message : String(err),
        });
      }

      res.setHeader("Content-Disposition", `attachment; filename="${templateId}.docx"`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      return res.send(mergedBuffer);
    }

    if (format === "pdf") {
      if (templateType === "pdf") {
        res.setHeader("Content-Disposition", `attachment; filename="${templateId}.pdf"`);
        res.setHeader("Content-Type", "application/pdf");
        return fs.createReadStream(templatePath).pipe(res);
      }

      if (templateType === "docx") {
        if (!mergedBuffer) {
          logError("generateDocument.noMergedBufferForPdf");
          return res.status(500).json({
            success: false,
            error: "No merged buffer for PDF conversion",
          });
        }
        try {
          logDebug("generateDocument.pdfConversion.start", { bufferSize: mergedBuffer.length });
          const pdfBuffer = await convertDocxToPdf(mergedBuffer);
          logDebug("generateDocument.pdfConversion.success", { size: pdfBuffer.length });

          try {
            const blobUrl = await uploadToAzureBlob(
              Buffer.from(pdfBuffer),
              `${templateId}.pdf`,
              customerId,
              "application/pdf"
            );
            logDebug("generateDocument.pdfUploadedToAzure", { blobUrl });
          } catch (err) {
            logError("generateDocument.pdfUploadError", {
              message: err instanceof Error ? err.message : String(err),
            });
          }

          res.setHeader("Content-Disposition", `attachment; filename="${templateId}.pdf"`);
          res.setHeader("Content-Type", "application/pdf");
          return res.send(pdfBuffer);
        } catch (err) {
          logError("generateDocument.pdfConversionError", {
            message: err instanceof Error ? err.message : String(err),
          });
          return res.status(500).json({
            success: false,
            error: "PDF conversion failed",
          });
        }
      }
    }

    if (format === "html") {
      if (templateType === "docx") {
        if (!mergedBuffer) {
          logError("generateDocument.noMergedBufferForHtml");
          return res.status(500).json({
            success: false,
            error: "No merged buffer generated for HTML preview",
          });
        }
        const { value: html } = await mammoth.convertToHtml({ buffer: mergedBuffer });
        logDebug("generateDocument.htmlPreview.success", { length: html.length });
        return res.json({
          previewHtml: html,
          metadata: { templateId, customerId, templateType, seedType },
        });
      }

      if (templateType === "pdf") {
        return res.status(501).json({
          success: false,
          error: "HTML preview not yet supported for PDF templates",
          metadata: { templateId, customerId, templateType, seedType },
        });
      }
    }

    return res.status(400).json({ success: false, error: "Unsupported format or template type" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logError("generateDocument.error", { message: err.message, stack: err.stack });
      return res.status(500).json({ success: false, error: err.message });
    }

    if (typeof err === "object" && err !== null && "properties" in err) {
      const e = err as { message?: string; properties?: any };
      logError("generateDocument.templateError", {
        message: e.message,
        explanation: e.properties?.explanation,
        tag: e.properties?.xtag,
      });
      return res.status(500).json({
        success: false,
        error: e.message || "Template error",
      });
    }

    logError("generateDocument.unknownError", { err });
    return res.status(500).json({ success: false, error: "Unknown error" });
  }
});

export default router;
