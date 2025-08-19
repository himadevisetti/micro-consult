import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import { getSerializedClauses } from '../../utils/serializeClauses';
export default function StandardPreview({ html, onRefresh, metadata, formData, }) {
    const previewRef = useRef(null);
    const navigate = useNavigate();
    const clauseComponents = getSerializedClauses(formData);
    const handleExportPDF = async () => {
        const content = previewRef.current?.innerHTML;
        if (!content) {
            console.warn('No content found in previewRef for PDF export.');
            return;
        }
        try {
            await exportRetainer('pdf', formData, content);
        }
        catch (err) {
            console.error('PDF export failed in StandardPreview:', err);
        }
    };
    const handleExportDOCX = async () => {
        const content = previewRef.current?.innerHTML;
        if (!content) {
            console.warn('No content found in previewRef for DOCX export.');
            return;
        }
        try {
            await exportRetainer('docx', formData, content);
        }
        catch (err) {
            console.error('DOCX export failed in StandardPreview:', err);
        }
    };
    return (_jsxs("div", { className: styles.previewContainer, children: [_jsx("div", { className: styles.previewHeader, children: _jsx("button", { onClick: () => navigate('/builder?template=standard-retainer'), children: "\u2B05\uFE0F Back to Form" }) }), _jsxs("div", { ref: previewRef, className: styles.retainerPreview, children: [_jsx("h2", { style: { textAlign: 'center', fontWeight: 'bold' }, children: "STANDARD RETAINER AGREEMENT" }), Object.values(clauseComponents).map((Clause, i) => (_jsx(React.Fragment, { children: _jsx("div", { className: styles.clauseBlock, children: Clause }) }, i)))] }), _jsx(DownloadToggle, { onDownload: (type) => {
                    if (type === 'pdf') {
                        handleExportPDF();
                    }
                    else if (type === 'docx') {
                        handleExportDOCX();
                    }
                } })] }));
}
