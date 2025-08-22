import { jsx as _jsx } from "react/jsx-runtime";
// src/components/FormFlows/StandardRetainerFlow.tsx
import { useEffect } from 'react';
import StandardRetainerForm from './StandardRetainerForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import { defaultRetainerFormData } from '../../types/RetainerFormData';
import { normalizeFormData } from '../../utils/normalizeFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
export default function StandardRetainerFlow() {
    const today = new Date();
    const formattedToday = formatDateMMDDYYYY(today);
    const hydratedDefaults = {
        ...defaultRetainerFormData,
        startDate: formattedToday,
        endDate: formattedToday,
    };
    const { formData, rawFormData, handleChange: onRawChange, handleBlur, setFormData, setRawFormData, } = useSessionFormState('standardRetainerDraft', hydratedDefaults);
    const { updateField, errors, touched, markTouched, handleSubmit, } = useRetainerState(rawFormData, formData, setFormData);
    const onChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        updateField(field, value); // Keep validation state in sync
    };
    useEffect(() => {
        const saved = sessionStorage.getItem('retainerFormData');
        if (saved) {
            const parsed = JSON.parse(saved);
            const hydrated = normalizeFormData(parsed);
            setFormData(hydrated); // for UI rendering
            setRawFormData(hydrated); // for submission logic
        }
    }, []);
    return (_jsx("div", { className: "flow-container", style: { padding: '2rem' }, children: _jsx("div", { className: "form-section", children: _jsx(StandardRetainerForm, { formData: formData, rawFormData: rawFormData, onChange: onChange, onRawChange: onRawChange, onBlur: handleBlur, errors: errors, touched: touched, markTouched: markTouched, onSubmit: handleSubmit }) }) }));
}
