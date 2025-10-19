// src/server/routes/getManifest.ts
import { Router } from "express";
import fs from "fs";
import path from "path";

import { getCustomerManifestPath, storageBasePath } from "../config.js";
import { logDebug } from "../../utils/logger.js";

const router = Router();

/**
 * GET /api/templates/:customerId/:templateId/manifest
 * Returns the saved manifest JSON and a reference to the placeholderized template file
 */
router.get(
  "/templates/:customerId/:templateId/manifest",
  async (req, res) => {
    const { customerId, templateId } = req.params;

    try {
      // 1. Locate manifest file
      const manifestDir = getCustomerManifestPath(customerId);
      const manifestPath = path.join(manifestDir, `${templateId}.manifest.json`);

      if (!fs.existsSync(manifestPath)) {
        return res.status(404).json({
          success: false,
          error: "Manifest not found for this templateId",
        });
      }

      // 2. Read manifest JSON
      const manifestRaw = await fs.promises.readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestRaw);

      // 3. Locate placeholderized template file (.docx or .pdf)
      const customerTemplatePath = path.join(
        storageBasePath,
        customerId,
        "templates"
      );
      const docxPath = path.join(customerTemplatePath, `${templateId}.docx`);
      const pdfPath = path.join(customerTemplatePath, `${templateId}.pdf`);

      let templateFile: string | null = null;
      if (fs.existsSync(docxPath)) {
        // 🔹 Return fully qualified API path
        templateFile = `/api/templates/${customerId}/templates/${templateId}.docx`;
      } else if (fs.existsSync(pdfPath)) {
        templateFile = `/api/templates/${customerId}/templates/${templateId}.pdf`;
      }

      if (!templateFile) {
        return res.status(404).json({
          success: false,
          error: "Placeholderized template file not found",
        });
      }

      logDebug("getManifest.success", {
        customerId,
        templateId,
        manifestPath,
        templateFile,
      });

      return res.json({
        success: true,
        manifest,
        templateFile,
      });
    } catch (err) {
      logDebug("getManifest.error", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      return res.status(500).json({
        success: false,
        error: "Failed to load manifest/template file",
      });
    }
  }
);

export default router;
