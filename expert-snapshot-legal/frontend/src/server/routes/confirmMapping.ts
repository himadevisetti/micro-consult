// src/server/routes/confirmMapping.ts
// -----------------------------
// Route: /templates/:customerId/:templateId/confirm-mapping
// -----------------------------
// Confirms field mapping for a template, saves manifest, placeholderizes the seed,
// and persists both manifest + template into the Documents table.

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
import { sortCandidatesByDocumentOrder } from "../../utils/candidates/sortCandidatesByDocumentOrder.js";
import { track } from "../../../track.js";
import { createDocument } from "../../models/DocumentRepository.js";

const router = Router();

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
      const outExt = ext === ".pdf" ? ".docx" : ext;

      // 🔹 Derive seedType from extension
      const seedType = ext === ".pdf" ? "pdf" : "docx";

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
      const orderedEnrichedCandidates = sortCandidatesByDocumentOrder(enrichedCandidates);

      logDebug("confirmMapping.sortedCandidates", {
        ordered: orderedEnrichedCandidates.map((c) => ({
          schemaField: c.schemaField,
          raw: c.rawValue,
          placeholder: c.placeholder,
          page: c.pageNumber,
          y: c.yPosition,
        })),
      });

      // Note: unanchoredCandidates array includes both
      // (a) schemaField collisions (e.g. FeeAmount vs RetainerAmount with same rawValue)
      // (b) candidates missing positional anchors (pageNumber/yPosition) and not deleted from UI
      // Deleted fields are tracked separately in mergeMappingWithCandidates.ts via deletedFields.
      const unanchored = orderedEnrichedCandidates.filter(c => c.pageNumber == null);
      logDebug("confirmMapping.unanchoredCandidates", {
        count: unanchored.length,
        fields: unanchored.map(c => c.schemaField),
      });

      // 4. Build manifest from enriched candidates
      const templateName = `${templateId}-template${outExt}`;
      const manifest = {
        templateId: templateName,
        customerId,
        createdAt: new Date().toISOString(),
        seedType,
        variables: orderedEnrichedCandidates.map(enrichMapping),
      };

      // 5. Save manifest
      const customerManifestPath = getCustomerManifestPath(customerId);
      await fs.promises.mkdir(customerManifestPath, { recursive: true });
      const manifestPath = path.join(
        customerManifestPath,
        `${templateId}-manifest.json`
      );
      await fs.promises.writeFile(
        manifestPath,
        JSON.stringify(manifest, null, 2)
      );

      logDebug("confirmMapping.manifestSaved", {
        manifestPath,
        templateId,
        customerId,
        seedType,
      });

      // Write manifest into Documents table
      const manifestStats = await fs.promises.stat(manifestPath);
      await createDocument(
        customerId,
        "confirmMapping",
        "json",
        manifestPath,
        path.basename(manifestPath),
        manifestStats.size,
        "AzureFiles",
        `/storage/${customerId}/manifests/${path.basename(manifestPath)}`
      );

      // 6. Placeholderize with enriched candidates + clauseBlocks
      const { placeholderBuffer } = await placeholderizeDocument(
        buffer,
        orderedEnrichedCandidates,
        ext.replace(".", ""),
        clauseBlocks,
        seedFilePath
      );

      // 7. Save placeholderized copy
      const customerTemplatePath = path.join(storageBasePath, customerId, "templates");
      await fs.promises.mkdir(customerTemplatePath, { recursive: true });
      const templatePath = path.join(customerTemplatePath, templateName);
      await fs.promises.writeFile(templatePath, placeholderBuffer);

      // Write placeholderized template into Documents table
      const templateStats = await fs.promises.stat(templatePath);
      await createDocument(
        customerId,
        "confirmMapping",
        seedType,
        templatePath,
        templateName,
        templateStats.size,
        "AzureFiles",
        `/storage/${customerId}/templates/${templateName}`
      );

      // 8. Clean up session store
      await deleteCandidates(`candidates:${templateId}`);

      logDebug("confirmMapping.placeholderized", {
        templatePath,
        placeholders: orderedEnrichedCandidates
          .filter((c) => c.placeholder)
          .map((c) => ({ field: c.schemaField, placeholder: c.placeholder })),
      });

      // 9. Telemetry
      await track("mapping_confirmed", {
        customerId,
        templateId,
        seedType,
        placeholderCount: orderedEnrichedCandidates.length,
      });

      return res.json({
        success: true,
        placeholders: orderedEnrichedCandidates,
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
