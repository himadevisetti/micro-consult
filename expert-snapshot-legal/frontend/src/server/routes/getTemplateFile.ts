import { Router } from "express";
import fs from "fs";
import path from "path";
import { storageBasePath } from "../config.js";
import { logDebug } from "../../utils/logger.js";

const router = Router();

/**
 * GET /api/templates/:customerId/templates/:filename
 * Streams the placeholderized template file (DOCX or PDF) back to the client.
 */
router.get("/templates/:customerId/templates/:filename", async (req, res) => {
  const { customerId, filename } = req.params;

  try {
    const filePath = path.join(storageBasePath, customerId, "templates", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Template file not found",
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeType =
      ext === ".docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : ext === ".pdf"
        ? "application/pdf"
        : "application/octet-stream";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    logDebug("getTemplateFile.success", { customerId, filename, filePath });

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    logDebug("getTemplateFile.error", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({
      success: false,
      error: "Failed to stream template file",
    });
  }
});

export default router;

