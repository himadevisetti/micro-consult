import { generateDOCX } from './generateDOCX.js';
import { getFilename } from '../../utils/generateFilename.js';
import { FormType, RetainerTypeLabel } from '@/types/FormType';

function slugifyFormType(formType: FormType): string {
  return String(formType)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // collapse non-alphanumerics to hyphens
    .replace(/^-+|-+$/g, '');      // trim leading/trailing hyphens
}

function resolveMetadata(formData: Record<string, any>, formType: FormType) {
  const client = formData.clientName?.trim() || 'Client';

  const purpose = (() => {
    switch (formType) {
      case FormType.IPRightsLicensing:
        return 'IP rights licensing agreement';
      case FormType.StandardRetainer:
        return 'Standard retainer agreement';
      default:
        return 'Legal services agreement';
    }
  })();

  return { client, purpose };
}

export async function exportRetainer<T extends Record<string, any>>(
  type: 'pdf' | 'docx',
  formType: FormType,
  formData: T,
  html?: string
) {
  const { client: resolvedClient, purpose: resolvedMatter } = resolveMetadata(formData, formType);

  const retainerType = RetainerTypeLabel[formType];
  const normalizedFormType = slugifyFormType(formType); // e.g. 'ip-rights-licensing'
  const today = new Date().toISOString(); // let getFilename handle date formatting

  const filename = getFilename(
    type === 'pdf' ? 'final' : 'draft',
    resolvedClient,
    today,
    normalizedFormType
  );

  let blob: Blob | null = null;

  try {
    if (!html) throw new Error(`Missing HTML for ${type.toUpperCase()} export`);

    if (type === 'pdf') {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, filename }),
      });

      if (!response.ok) throw new Error(`PDF export failed: ${response.statusText}`);

      const arrayBuffer = await response.arrayBuffer();
      blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    } else {
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
            formType: normalizedFormType,
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
