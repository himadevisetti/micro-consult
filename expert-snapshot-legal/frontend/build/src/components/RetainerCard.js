import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from '../styles/HomePage.module.css';
const RetainerCard = ({ title, templateId, iconSrc, onStart }) => {
    const getAltText = (iconName) => {
        switch (iconName) {
            case 'standard-retainer':
                return 'Standard Retainer Icon';
            case 'ip-counsel':
                return 'IP Counsel Retainer Icon';
            case 'custom-template':
                return 'Custom Template Icon';
        }
    };
    return (_jsxs("button", { className: styles.retainerCard, onClick: () => onStart(templateId), children: [_jsx("img", { src: `/icons/${iconSrc}.svg`, alt: getAltText(iconSrc), className: styles.cardIcon }), _jsx("h3", { children: title })] }));
};
export default RetainerCard;
