import { generateDOCX } from './generateDOCX.js';
import { getSerializedClauses } from '../../utils/serializeClauses.js';
import { getFilename } from '../../utils/generateFilename.js';
import { getSignatureBlock } from '../signatureUtils.js';
import type { RetainerFormData } from '../../types/RetainerFormData.js';
import type { FeeStructure } from '../../types/RetainerFormData.js';
import { formatDateMMDDYYYY } from '../../utils/formatDate.js';
import { FormType, RetainerTypeLabel } from '@/types/FormType';

export async function exportRetainer(
  type: 'pdf' | 'docx',
  formData: RetainerFormData,
  html?: string
) {
  const resolvedClient = formData.clientName?.trim() || 'Client';
  const resolvedProvider = formData.providerName?.trim() || 'Expert Snapshot Legal';
  const resolvedMatter = formData.matterDescription?.trim() || 'general legal services';
  const resolvedFeeAmount = formData.feeAmount || 0;
  const resolvedRetainerAmount = formData.retainerAmount || 1500;
  const resolvedFeeStructure = formData.feeStructure;
  const resolvedJurisdiction = formData.jurisdiction?.trim() || 'California';
  const resolvedStartDate = formData.startDate;
  const resolvedEndDate = formData.endDate;
  const formattedStartDate = formatDateMMDDYYYY(resolvedStartDate);
  const formattedEndDate = formatDateMMDDYYYY(resolvedEndDate);

  const serializedClauses = getSerializedClauses(formData, {
    exclude: ['signatureClause'],
  });

  const signatureBlock = getSignatureBlock({
    clientName: resolvedClient,
    providerName: resolvedProvider,
    executionDate: formattedStartDate,
  });

  const retainerType = RetainerTypeLabel[FormType.StandardRetainer]; // You can make this dynamic later
  const normalizedFormType = FormType.StandardRetainer.replace(/\s+/g, '_');

  const data: Record<string, string> = {
    providerName: resolvedProvider,
    executionDate: formattedStartDate,
    matterDescription: resolvedMatter,
    retainerType,
    feeAmount: String(resolvedFeeAmount),
    retainerAmount: String(resolvedRetainerAmount),
    feeStructure: resolvedFeeStructure,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    jurisdiction: resolvedJurisdiction,
    ...serializedClauses,
  };

  const today = new Date().toISOString();
  const filename = getFilename(
    type === 'pdf' ? 'final' : 'draft',
    resolvedClient,
    today,
    normalizedFormType
  );

  let blob: Blob | null = null;

  try {
    if (type === 'pdf') {
      if (!html) throw new Error('Missing HTML for PDF export');

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, filename }),
      });

      if (!response.ok) throw new Error(`PDF export failed: ${response.statusText}`);

      const arrayBuffer = await response.arrayBuffer();
      blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    } else {
      blob = await generateDOCX(data, signatureBlock);
    }
  } catch (err) {
    console.error(`[Export Error] Failed to generate ${type.toUpperCase()} blob:`, err);
    alert('Export failed. Please try again or contact support.');
    return;
  }

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
            purpose: resolvedMatter,
            template: retainerType,
          },
        }),
      });
    } catch (err) {
      console.warn('Failed to save export:', err);
    }
  }

  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    console.warn('No file blob was generated for download.');
  }
}
