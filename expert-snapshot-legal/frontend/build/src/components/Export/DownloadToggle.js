import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from '../../styles/ExportToggle.module.css';
export default function DownloadToggle({ onDownload, }) {
    return (_jsxs("div", { className: styles.downloadToggle, children: [_jsx("p", { children: _jsx("strong", { children: "Download As:" }) }), _jsx("button", { className: styles.downloadButton, onClick: () => onDownload('docx'), children: "\uD83D\uDCDD Editable (.docx)" }), _jsx("button", { className: styles.downloadButton, onClick: () => onDownload('pdf'), children: "\uD83E\uDDFE Final (.pdf)" })] }));
}
