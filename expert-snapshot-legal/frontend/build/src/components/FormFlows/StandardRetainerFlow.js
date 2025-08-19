import { jsx as _jsx } from "react/jsx-runtime";
import StandardRetainerForm from './StandardRetainerForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import { defaultRetainerFormData } from '../../types/RetainerFormData';
export default function StandardRetainerFlow() {
    const { formData, rawFormData, handleChange: onRawChange, handleBlur, setFormData, } = useSessionFormState('standardRetainerDraft', defaultRetainerFormData);
    const { updateField, errors, touched, markTouched, handleSubmit, } = useRetainerState(rawFormData, formData, setFormData);
    const onChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        updateField(field, value); // Keep validation state in sync
    };
    return (_jsx("div", { className: "flow-container", style: { padding: '2rem' }, children: _jsx("div", { className: "form-section", children: _jsx(StandardRetainerForm, { formData: formData, rawFormData: rawFormData, onChange: onChange, onRawChange: onRawChange, onBlur: handleBlur, errors: errors, touched: touched, markTouched: markTouched, onSubmit: handleSubmit }) }) }));
}
