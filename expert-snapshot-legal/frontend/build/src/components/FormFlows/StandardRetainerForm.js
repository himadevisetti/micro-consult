import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { standardRetainerSchema } from '../../schemas/standardRetainerSchema.js';
import StandardPreview from '../AgreementPreview/StandardPreview.js';
import { exportRetainer } from '../../utils/export/exportHandler.js';
import { getSerializedClauses } from '../../utils/serializeClauses.js';
export default function StandardRetainerForm() {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [previewElement, setPreviewElement] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };
    const validateForm = () => {
        const newErrors = {};
        for (const [key, config] of Object.entries(standardRetainerSchema)) {
            const value = formData[key];
            if (config.required && !value) {
                newErrors[key] = `${config.label} is required.`;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(false);
        if (validateForm()) {
            console.log('Payload:', formData);
            setSubmitted(true);
        }
    };
    const renderField = (key, config) => {
        const error = errors[key];
        const commonProps = {
            name: key,
            value: formData[key] || '',
            onChange: handleChange,
            required: config.required,
        };
        return (_jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: key, children: config.label }), config.type === 'select' ? (_jsxs("select", { ...commonProps, children: [_jsxs("option", { value: "", children: ["Select ", config.label] }), config.options?.map((option) => (_jsx("option", { value: option, children: option }, option)))] })) : (_jsx("input", { id: key, type: config.type || 'text', placeholder: config.placeholder, ...commonProps })), error && _jsx("p", { className: "error", children: error })] }, key));
    };
    const handleDownload = async (type) => {
        const clauseHTML = getSerializedClauses(formData);
        const agreementData = {
            ...formData,
            legalGroup: 'Expert Snapshot Legal',
            executionDate: formData.startDate,
            ...clauseHTML,
        };
        try {
            await exportRetainer(type, agreementData);
        }
        catch (err) {
            console.error(`Export failed for ${type}:`, err);
        }
    };
    return (_jsxs("div", { children: [_jsxs("form", { className: "retainer-form", onSubmit: handleSubmit, children: [Object.entries(standardRetainerSchema).map(([key, config]) => renderField(key, config)), _jsx("button", { type: "submit", children: "Submit" }), submitted && _jsx("p", { className: "success", children: "Form submitted successfully! \u2705" })] }), submitted && (_jsx(_Fragment, { children: _jsx(StandardPreview, { formData: formData, onRefReady: setPreviewElement }) }))] }));
}
