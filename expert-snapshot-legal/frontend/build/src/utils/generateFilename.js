export function getFilename(mode, clientName, executionDate, retainerPurpose) {
    const safeName = (clientName || 'Client').trim().replace(/\s+/g, '_');
    const purpose = (retainerPurpose || 'Retainer').trim().replace(/\s+/g, '_');
    const safeDate = executionDate?.trim().split('T')[0] || 'unspecified';
    const extension = mode === 'final' ? 'pdf' : 'docx';
    return `${safeName}-${purpose}-${safeDate}_${mode}.${extension}`;
}
