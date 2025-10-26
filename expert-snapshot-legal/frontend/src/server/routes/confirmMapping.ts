// src/server/routes/confirmMapping.ts
import { Router } from "express";
import fs from "fs";
import path from "path";

import { NormalizedMapping } from "../../types/confirmMapping.js";
import { logDebug } from "../../utils/logger.js";
import {
  getCustomerManifestPath,
  storageBasePath,
} from "../config.js";
import { loadCandidates, deleteCandidates } from "../../infrastructure/sessionStore.js";
import { mergeMappingWithCandidates } from "../adapters/mergeMappingWithCandidates.js";
import { placeholderizeDocument } from "../../utils/candidates/placeholderization.js";
import { enrichMapping } from "../utils/manifestEnrichment.js";

const router = Router();

// Confirm mapping route
router.post(
  "/templates/:customerId/:templateId/confirm-mapping",
  async (req, res) => {
    const { customerId, templateId } = req.params;
    const mapping = req.body as NormalizedMapping[];

    if (!Array.isArray(mapping) || mapping.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No mapping provided" });
    }

    // 🔹 Validate required fields
    const valid = mapping.every(
      (m) =>
        typeof m.raw === "string" &&
        m.raw.trim() !== "" &&
        typeof m.schemaField === "string" &&
        m.schemaField.trim() !== "" &&
        typeof m.placeholder === "string" &&
        m.placeholder.trim() !== ""
    );
    if (!valid) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid mapping format" });
    }

    try {
      // 1. Load original seed file
      const customerSeedPath = path.join(storageBasePath, customerId, "_seed");
      const seedFilePathDocx = path.join(customerSeedPath, `${templateId}.docx`);
      const seedFilePathPdf = path.join(customerSeedPath, `${templateId}.pdf`);
      const seedFilePath = fs.existsSync(seedFilePathDocx)
        ? seedFilePathDocx
        : seedFilePathPdf;
      const buffer = await fs.promises.readFile(seedFilePath);
      const ext = path.extname(seedFilePath).toLowerCase();

      // 2. Load stored candidates + clauseBlocks from sessionStore
      const stored = await loadCandidates(`candidates:${templateId}`);
      if (!stored) {
        return res.status(400).json({
          success: false,
          error: "No stored candidates found for this templateId",
        });
      }
      const { candidates, clauseBlocks } = stored;

      // 3. Merge NormalizedMapping[] into stored candidates
      const enrichedCandidates = mergeMappingWithCandidates(mapping, candidates);

      // 4. Build manifest from enriched candidates
      const manifest = {
        templateId,
        customerId,
        createdAt: new Date().toISOString(),
        variables: enrichedCandidates.map(enrichMapping),
      };

      // 5. Save manifest
      const customerManifestPath = getCustomerManifestPath(customerId);
      await fs.promises.mkdir(customerManifestPath, { recursive: true });
      const manifestPath = path.join(
        customerManifestPath,
        `${templateId}.manifest.json`
      );
      await fs.promises.writeFile(
        manifestPath,
        JSON.stringify(manifest, null, 2)
      );

      logDebug("confirmMapping.manifestSaved", {
        manifestPath,
        templateId,
        customerId,
      });

      // 6. Placeholderize with enriched candidates + clauseBlocks
      const { placeholderBuffer } = await placeholderizeDocument(
        buffer,
        enrichedCandidates,
        ext,
        clauseBlocks
      );

      // 7. Save placeholderized copy
      const customerTemplatePath = path.join(
        storageBasePath,
        customerId,
        "templates"
      );
      await fs.promises.mkdir(customerTemplatePath, { recursive: true });
      const templatePath = path.join(
        customerTemplatePath,
        `${templateId}${ext}`
      );
      await fs.promises.writeFile(templatePath, placeholderBuffer);

      // 8. Clean up session store
      await deleteCandidates(`candidates:${templateId}`);

      logDebug("confirmMapping.placeholderized", {
        templatePath,
        placeholders: enrichedCandidates
          .filter((c) => c.placeholder)
          .map((c) => ({ field: c.schemaField, placeholder: c.placeholder })),
      });

      return res.json({
        success: true,
        placeholders: enrichedCandidates,
      });
    } catch (err) {
      logDebug("confirmMapping.error", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      return res.status(500).json({
        success: false,
        error: "Failed to save manifest/placeholderize",
      });
    }
  }
);

export default router;
