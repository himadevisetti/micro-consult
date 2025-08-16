import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/HomePage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
const HomePage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach((btn, i) => {
            console.log(`Button #${i}:`, btn.textContent);
        });
    }, []);
    const handleStart = (templateId) => {
        navigate(`/builder?template=${templateId}`);
    };
    const RetainerCard = ({ title, templateId }) => (_jsx("button", { className: styles.retainerCard, onClick: () => handleStart(templateId), children: _jsx("h3", { children: title }) }));
    return (_jsxs("main", { className: styles.landing, children: [_jsxs("header", { children: [_jsx("h1", { children: "Welcome to Expert Snapshot Legal" }), _jsx("p", { children: "Generate retainer agreements from any template with precision and control." })] }), _jsxs("section", { className: styles.templateOptions, children: [_jsx("h2", { children: "Select a Retainer Type" }), _jsxs("div", { className: styles.retainerCardGrid, children: [_jsx(RetainerCard, { title: RetainerTypeLabel[FormType.StandardRetainer], templateId: FormType.StandardRetainer }), _jsx(RetainerCard, { title: RetainerTypeLabel[FormType.IPCounselRetainer], templateId: FormType.IPCounselRetainer }), _jsx(RetainerCard, { title: RetainerTypeLabel[FormType.CustomTemplate], templateId: FormType.CustomTemplate })] })] })] }));
};
export default HomePage;
