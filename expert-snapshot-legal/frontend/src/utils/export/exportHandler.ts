import { generateDOCX } from './generateDOCX.js';
import { getFilename } from '../../utils/generateFilename.js';
import type { RetainerFormData } from '../../types/RetainerFormData.js';
import { formatDateMMDDYYYY } from '../../utils/formatDate.js';
import { FormType, RetainerTypeLabel } from '@/types/FormType';

export async function exportRetainer(
  type: 'pdf' | 'docx',
  formData: RetainerFormData,
  html?: string
) {
  const resolvedClient = formData.clientName?.trim() || 'Client';
  const resolvedMatter = formData.matterDescription?.trim() || 'general legal services';

  const retainerType = RetainerTypeLabel[FormType.StandardRetainer];
  const normalizedFormType = FormType.StandardRetainer.replace(/\s+/g, '_');
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
      if (!html) throw new Error('Missing HTML for DOCX export');

      blob = await generateDOCX({ html, filename });
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
