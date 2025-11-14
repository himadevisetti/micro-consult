// src/server/routes/listTemplates.ts

import { Router } from "express";
import fs from "fs";
import path from "path";
import { logDebug } from "../../utils/logger.js";
import {
  getCustomerTemplatePath,
  getCustomerManifestPath,
  allowedExtensions,
} from "../config.js";
import { track } from "../../../track.js";

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

      // 🔹 Fire telemetry non-blocking
      track("template_listed", {
        customerId,
        templateCount: 0,
        manifestCount: 0,
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
        const manifestPath = path.join(customerManifestPath, `${id}.manifest.json`);
        const hasManifest = fs.existsSync(manifestPath);

        let createdAt: string | null = null;

        // Try manifest first
        if (hasManifest) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
            if (manifest.createdAt) {
              createdAt = manifest.createdAt;
            }
          } catch (err: any) {
            logDebug("getTemplates.manifestReadError", {
              templateId: id,
              error: err.message,
            });
          }
        }

        // Fallback to file birthtime
        if (!createdAt) {
          try {
            const stats = fs.statSync(path.join(customerTemplatePath, f));
            createdAt = stats.birthtime.toISOString();
          } catch (err: any) {
            logDebug("getTemplates.fileStatError", {
              templateId: id,
              error: err.message,
            });
          }
        }

        return {
          id,
          name: f,
          hasManifest,
          createdAt,
        };
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

    const manifestCount = templates.filter(t => t.hasManifest).length;
    const missingManifestCount = templates.length - manifestCount;

    logDebug("getTemplates.success", {
      customerId,
      templateCount: templates.length,
      manifestCount,
      missingManifestCount,
    });

    // 🔹 Fire telemetry non-blocking
    track("template_listed", {
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
