import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
export default function StandardPreview({ html, onRefresh, metadata = {} }) {
    const previewRef = useRef(null);
    const handleExportPDF = async () => {
        const content = previewRef.current?.innerHTML;
        if (!content) {
            console.warn('No content found in previewRef for PDF export.');
            return;
        }
        try {
            await exportRetainer('pdf', metadata, content);
        }
        catch (err) {
            console.error('PDF export failed in StandardPreview:', err);
        }
    };
    const handleExportDOCX = async () => {
        try {
            await exportRetainer('docx', metadata);
        }
        catch (err) {
            console.error('DOCX export failed in StandardPreview:', err);
        }
    };
    return (_jsxs("div", { className: styles.previewContainer, children: [_jsxs("div", { className: styles.previewHeader, children: [_jsx("h2", { className: styles.retainerTitle, children: "Legal Retainer Agreement" }), _jsx("button", { onClick: onRefresh, children: "\uD83D\uDD04 Refresh Preview" })] }), _jsx("div", { ref: previewRef, className: styles.retainerPreview, dangerouslySetInnerHTML: { __html: html } }), _jsx(DownloadToggle, { onDownload: (type) => {
                    if (type === 'pdf') {
                        handleExportPDF();
                    }
                    else if (type === 'docx') {
                        handleExportDOCX();
                    }
                } })] }));
}
