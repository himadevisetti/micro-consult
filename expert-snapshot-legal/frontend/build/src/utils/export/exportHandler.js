import { generateDOCX } from './generateDOCX.js';
import { getSerializedClauses } from '../../utils/serializeClauses.js';
import { getFilename } from '../../utils/generateFilename.js';
import { getSignatureBlock } from '../signatureUtils.js';
export async function exportRetainer(type, rawData, html // ✅ Optional HTML for PDF
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
    const data = {
        ...rawData,
        legalGroup: resolvedGroup,
        executionDate: resolvedDate,
        retainerPurpose: rawData.retainerPurpose || 'Retainer',
        retainerType: rawData.retainerType || 'Standard Legal Retainer',
        ...serializedClauses,
    };
    const today = new Date().toISOString();
    const filename = getFilename(type === 'pdf' ? 'final' : 'draft', resolvedClient, today, data.retainerPurpose);
    let blob = null;
    try {
        if (type === 'pdf') {
            if (!html)
                throw new Error('Missing HTML for PDF export');
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, filename }), // ✅ Send both
            });
            if (!response.ok)
                throw new Error(`PDF export failed: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        }
        else {
            blob = await generateDOCX(data, signatureBlock);
        }
    }
    catch (err) {
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
        }
        catch (err) {
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
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    else {
        console.warn('No file blob was generated for download.');
    }
}
