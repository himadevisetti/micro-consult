import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
export default function StandardPreview({ html, onRefresh, metadata, formData, }) {
    const previewRef = useRef(null);
    const navigate = useNavigate();
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
        try {
            await exportRetainer('docx', formData);
        }
        catch (err) {
            console.error('DOCX export failed in StandardPreview:', err);
        }
    };
    return (_jsxs("div", { className: styles.previewContainer, children: [_jsx("div", { className: styles.previewHeader, children: _jsx("button", { onClick: () => navigate('/builder?template=standard-retainer'), children: "\u2B05\uFE0F Back to Form" }) }), _jsx("div", { ref: previewRef, className: styles.retainerPreview, dangerouslySetInnerHTML: { __html: html } }), _jsx(DownloadToggle, { onDownload: (type) => {
                    if (type === 'pdf') {
                        handleExportPDF();
                    }
                    else if (type === 'docx') {
                        handleExportDOCX();
                    }
                } })] }));
}
