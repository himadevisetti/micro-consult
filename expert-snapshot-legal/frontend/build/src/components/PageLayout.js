import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AppHeader from './AppHeader';
import styles from '../styles/PageLayout.module.css';
import { useLocation } from 'react-router-dom';
const PageLayout = ({ children, showHomeButton, onHomeClick, onBackClick, scrollable = false, }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const shouldShowHomeButton = showHomeButton ?? !isHomePage;
    return (_jsxs("div", { className: `${styles.pageWrapper} ${scrollable ? styles.scrollablePage : ''}`, children: [_jsx(AppHeader, { showHomeButton: shouldShowHomeButton, onHomeClick: onHomeClick, onBackClick: onBackClick }), _jsx("main", { className: `${styles.pageContent} ${!isHomePage ? styles.fullWidth : ''}`, children: children })] }));
};
export default PageLayout;
