import { generatePDF } from './generatePDF';
import { generateDOCX } from './generateDOCX';
import { getSerializedClauses } from '../../utils/serializeClauses';
import { getFilename } from '../../utils/generateFilename';
import { getSignatureBlock } from '../signatureUtils';

export async function exportRetainer(
  type: 'pdf' | 'docx',
  rawData: Record<string, string>,
  previewElement?: HTMLElement
) {
  const resolvedClient = rawData.clientName?.trim() || 'Client';
  const resolvedGroup = rawData.legalGroup?.trim() || 'Expert Snapshot Legal';
  const resolvedDate = rawData.startDate?.trim() || 'the date of execution';

  delete rawData['Signatures'];

  const serializedClauses = getSerializedClauses(rawData, {
    exclude: ['signatureClause'],
  });

  const signatureBlock = getSignatureBlock({
    clientName: resolvedClient,
    legalGroup: resolvedGroup,
    executionDate: resolvedDate,
  });

  const data: Record<string, string> = {
    ...rawData,
    legalGroup: resolvedGroup,
    executionDate: resolvedDate,
    retainerPurpose: rawData.retainerPurpose || 'Retainer',
    retainerType: rawData.retainerType || 'Standard Legal Retainer',
    ...serializedClauses,
  };

  const today = new Date().toISOString();
  const filename = getFilename(
    type === 'pdf' ? 'final' : 'draft',
    resolvedClient,
    today,
    data.retainerPurpose
  );

  // 🧯 Ensure preview is stable before generating PDF
  if (type === 'pdf') {
    if (!previewElement || !document.body.contains(previewElement)) {
      console.warn('Preview element is missing or detached.');
      alert('Cannot generate PDF: preview not available.');
      return;
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  // 🧱 Blob generation with error handling
  let blob: Blob | null = null;

  try {
    blob =
      type === 'pdf' ? await generatePDF(previewElement) : await generateDOCX(data, signatureBlock);
  } catch (err) {
    console.error(`[Export Error] Failed to generate ${type.toUpperCase()} blob:`, err);
    alert('Export failed. Please try again or contact support.');
    return;
  }

  // 💾 Local save (dev only)
  if (process.env.NODE_ENV === 'development' && blob && typeof blob.arrayBuffer === 'function') {
    try {
      const fileArrayBuffer = await blob.arrayBuffer();
      const fileData = Array.from(new Uint8Array(fileArrayBuffer));

      await fetch('/api/saveExport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          fileData,
          metadata: {
            client: resolvedClient,
            purpose: data.retainerPurpose,
            template: data.retainerType,
          },
        }),
      });
    } catch (err) {
      console.warn('Failed to save export:', err);
    }
  }

  // 📥 Trigger download
  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);

    link.click(); // ⬅️ Direct, synchronous trigger
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Optional cleanup
  } else {
    console.warn('No file blob was generated for download.');
  }
}
