import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/HomePage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import AppHeader from '../components/AppHeader';
import RetainerCard from '../components/RetainerCard';
const HomePage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        sessionStorage.clear();
    }, []);
    const handleStart = (templateId) => {
        navigate(`/builder?template=${templateId}`);
    };
    return (_jsxs("div", { className: styles.pageWrapper, children: [_jsx(AppHeader, { showHomeButton: false }), _jsxs("main", { className: styles.landing, children: [_jsxs("header", { className: styles.hero, children: [_jsx("h1", { children: "Welcome to Expert Snapshot Legal" }), _jsx("p", { children: "Generate retainer agreements from any template with precision and control." })] }), _jsxs("section", { className: styles.templateOptions, children: [_jsx("h2", { children: "Select a Retainer Type" }), _jsxs("div", { className: styles.retainerCardGrid, children: [_jsx(RetainerCard, { title: RetainerTypeLabel[FormType.StandardRetainer], templateId: FormType.StandardRetainer, iconSrc: "standard-retainer", onStart: handleStart }), _jsx(RetainerCard, { title: RetainerTypeLabel[FormType.IPCounselRetainer], templateId: FormType.IPCounselRetainer, iconSrc: "ip-counsel", onStart: handleStart }), _jsx(RetainerCard, { title: RetainerTypeLabel[FormType.CustomTemplate], templateId: FormType.CustomTemplate, iconSrc: "custom-template", onStart: handleStart })] })] })] })] }));
};
export default HomePage;
