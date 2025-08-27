import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from '../styles/AppHeader.module.css';
const AppHeader = ({ showHomeButton = false, onHomeClick, onBackClick, }) => {
    return (_jsxs("header", { className: styles.header, children: [_jsx("div", { className: styles.logoSlot, children: "Logo" }), _jsxs("div", { className: styles.navRight, children: [onBackClick && (_jsx("button", { className: styles.homeButton, onClick: onBackClick, "aria-label": "Back to Form", children: "\u2B05\uFE0F Back" })), _jsx("button", { className: `${styles.homeButton} ${showHomeButton ? styles.visible : styles.hidden}`, onClick: onHomeClick, "aria-label": "Return to Home", children: "\uD83C\uDFE0 Home" })] })] }));
};
export default AppHeader;
