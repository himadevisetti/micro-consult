export function getFilename(
  mode: 'draft' | 'final',
  clientName?: string,
  executionDate?: string,
  retainerPurpose?: string
): string {
  const safeName = (clientName || 'Client').trim().replace(/\s+/g, '_');
  const purpose = (retainerPurpose || 'Retainer').trim().replace(/\s+/g, '_');

  const safeDate = executionDate?.trim().split('T')[0] || 'unspecified';
  const extension = mode === 'final' ? 'pdf' : 'docx';

  return `${safeName}-${purpose}-${safeDate}_${mode}.${extension}`;
}
