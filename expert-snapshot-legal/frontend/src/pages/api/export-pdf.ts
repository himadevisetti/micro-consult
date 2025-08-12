import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePdfFromPreview } from '../../utils/export/generatePdfFromPreview.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { formData, filename } = req.body;
  const resolvedFilename = filename || 'retainer.pdf';

  try {
    const pdfBuffer = await generatePdfFromPreview(formData);
    const binary = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resolvedFilename}"`);
    res.send(binary);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}