import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { getClauses } from '../AgreementClauses/clauses.js';
import SignatureClause from '../AgreementClauses/SignatureClause.js';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler.js';
import DownloadToggle from '../Export/DownloadToggle.js';
export default function StandardPreview({ formData, onRefReady }) {
    const previewRef = useRef(null);
    useEffect(() => {
        if (onRefReady && previewRef.current) {
            onRefReady(previewRef.current);
        }
    }, [onRefReady]);
    const clauses = getClauses(formData);
    const handleExportPDF = async () => {
        const html = previewRef.current?.innerHTML;
        if (!html)
            return;
        try {
            await exportRetainer('pdf', formData, html);
        }
        catch (err) {
            console.error('PDF export failed:', err);
        }
    };
    const handleExportDOCX = async () => {
        try {
            await exportRetainer('docx', formData);
        }
        catch (err) {
            console.error('DOCX export failed:', err);
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { ref: previewRef, className: styles.retainerPreview, children: [_jsx("h2", { className: styles.retainerTitle, children: "Legal Retainer Agreement" }), _jsx("div", { className: styles.clausesFlow, children: clauses.map((clause, index) => (_jsx("div", { className: styles.clauseBlock, children: clause }, index))) }), _jsx("div", { className: styles.signatureWrapper, children: _jsx("div", { className: styles.signatureBlock, children: _jsx(SignatureClause, { clientName: formData.clientName, legalGroup: "Expert Snapshot Legal", executionDate: formData.startDate }) }) })] }), _jsx(DownloadToggle, { onDownload: (type) => {
                    if (type === 'pdf') {
                        handleExportPDF();
                    }
                    else if (type === 'docx') {
                        handleExportDOCX();
                    }
                } })] }));
}
