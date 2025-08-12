import { jsx as _jsx } from "react/jsx-runtime";
// src/pages/BuilderPage.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StandardRetainerForm from '../components/FormFlows/StandardRetainerForm.js';
import IPCounselForm from '../components/FormFlows/IPCounselForm.js';
import CustomUploadForm from '../components/FormFlows/CustomUploadForm.js';
const BuilderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const template = queryParams.get('template');
    const [isValid, setIsValid] = useState(false);
    useEffect(() => {
        if (!template)
            return;
        const validTemplates = ['standard-retainer', 'ip-counsel-retainer', 'custom-upload'];
        const normalized = template.toLowerCase();
        setIsValid(validTemplates.includes(normalized));
        if (!validTemplates.includes(normalized)) {
            navigate('/');
        }
    }, [template, navigate]);
    const renderForm = () => {
        switch (template?.toLowerCase()) {
            case 'standard-retainer':
                return _jsx(StandardRetainerForm, {});
            case 'ip-counsel-retainer':
                return _jsx(IPCounselForm, {});
            case 'custom-upload':
                return _jsx(CustomUploadForm, {});
            default:
                return null;
        }
    };
    return (_jsx("div", { className: "form-section", children: isValid ? renderForm() : _jsx("p", { children: "\uD83D\uDD04 Loading builder..." }) }));
};
export default BuilderPage;
