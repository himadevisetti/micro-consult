import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StandardRetainerFlow from '../components/FormFlows/StandardRetainerFlow';
import IPCounselForm from '../components/FormFlows/IPCounselForm';
import CustomUploadForm from '../components/FormFlows/CustomUploadForm';
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';
const FormRouterPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const template = queryParams.get('template')?.toLowerCase();
    const [isValid, setIsValid] = useState(false);
    useEffect(() => {
        const validTemplates = Object.values(FormType);
        if (!template || !validTemplates.includes(template)) {
            navigate('/');
            return;
        }
        setIsValid(true);
    }, [template, navigate]);
    const renderForm = () => {
        switch (template) {
            case FormType.StandardRetainer:
                return _jsx(StandardRetainerFlow, {});
            case FormType.IPCounselRetainer:
                return _jsx(IPCounselForm, {});
            case FormType.CustomTemplate:
                return _jsx(CustomUploadForm, {});
            default:
                return null;
        }
    };
    const handleHomeClick = () => {
        sessionStorage.clear();
        navigate('/');
    };
    return (_jsx(PageLayout, { onHomeClick: handleHomeClick, children: isValid && renderForm() }));
};
export default FormRouterPage;
