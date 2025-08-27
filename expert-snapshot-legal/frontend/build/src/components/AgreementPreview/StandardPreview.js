import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import { getSerializedClauses } from '../../utils/serializeClauses';
export default function StandardPreview({ html, onRefresh, metadata, formData, }) {
    const previewRef = useRef(null);
    const clauseComponents = getSerializedClauses(formData);
    const handleExport = async (type) => {
        const content = previewRef.current?.innerHTML;
        if (!content) {
            console.warn(`No content found in previewRef for ${type.toUpperCase()} export.`);
            return;
        }
        try {
            await exportRetainer(type, formData, content);
        }
        catch (err) {
            console.error(`${type.toUpperCase()} export failed in StandardPreview:`, err);
        }
    };
    return (_jsxs("div", { className: styles.previewContainer, children: [_jsxs("div", { ref: previewRef, className: styles.retainerPreview, children: [_jsx("h2", { className: styles.retainerTitle, children: "STANDARD RETAINER AGREEMENT" }), Object.values(clauseComponents).map((Clause, i) => (_jsx("div", { className: styles.clauseBlock, children: Clause }, i)))] }), _jsx(DownloadToggle, { onDownload: (type) => handleExport(type) })] }));
}
