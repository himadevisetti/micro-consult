export function getFilename(
  mode: 'draft' | 'final',
  clientName?: string,
  executionDate?: string,
  retainerPurpose?: string
): string {
  const safeName = (clientName || 'Client').trim().replace(/\s+/g, '_');
  const purpose = (retainerPurpose || 'Retainer').trim().replace(/\s+/g, '_');
  const date = executionDate?.split('T')[0] || new Date().toISOString().split('T')[0];
  const extension = mode === 'final' ? 'pdf' : 'docx';

  return `${safeName}-${purpose}-${date}_${mode}.${extension}`;
}
