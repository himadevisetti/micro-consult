// src/server/routes/exportPdf.ts
import { Router } from "express";
import { generatePdfFromPreview } from "../../utils/export/generatePdfFromPreview.js";

const router = Router();

// ✅ Export PDF route
router.post("/export-pdf", async (req, res) => {
  try {
    const { html, filename = "agreement.pdf" } = req.body;

    if (!html || typeof html !== "string") {
      console.warn("[PDF Middleware] Missing or invalid HTML");
      return res.status(400).send("Invalid HTML payload");
    }

    const pdfBuffer = await generatePdfFromPreview(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[PDF Export Error]", err);
    res.status(500).send("PDF generation failed");
  }
});

export default router;

