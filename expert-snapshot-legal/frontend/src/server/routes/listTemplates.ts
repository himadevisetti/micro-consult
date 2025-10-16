// src/server/routes/listTemplates.ts
import { Router } from "express";
import fs from "fs";
import path from "path";
import { logDebug } from "../../utils/logger.js";
import {
  getCustomerTemplatePath,
  getCustomerManifestPath,
  allowedExtensions,
} from "../config.js"; // centralized shared helpers/constants

const router = Router();

// Return list of templates for a customer
router.get("/templates/:customerId", (req, res) => {
  const { customerId } = req.params;

  const customerTemplatePath = getCustomerTemplatePath(customerId);
  const customerManifestPath = getCustomerManifestPath(customerId);

  fs.readdir(customerTemplatePath, (err, files) => {
    if (err || !files || files.length === 0) {
      logDebug("getTemplates.noFiles", {
        customerId,
        error: err ? err.message : null,
      });
      return res.json({ templates: [] });
    }

    const templates = files
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return allowedExtensions.has(ext);
      })
      .map((f) => {
        const id = path.parse(f).name;
        const manifestPath = path.join(
          customerManifestPath,
          `${id}.manifest.json`
        );
        const hasManifest = fs.existsSync(manifestPath);

        return {
          id,
          name: f,
          hasManifest,
        };
      });

    const manifestCount = templates.filter(t => t.hasManifest).length;
    const missingManifestCount = templates.length - manifestCount;

    logDebug("getTemplates.success", {
      customerId,
      templateCount: templates.length,
      manifestCount,
      missingManifestCount,
    });

    if (process.env.DEBUG_TRACE === "true") {
      logDebug("getTemplates.success.detail", {
        customerId,
        missingTemplates: templates.filter(t => !t.hasManifest).map(t => t.id),
      });
    }

    return res.json({ templates });
  });
});

export default router;

