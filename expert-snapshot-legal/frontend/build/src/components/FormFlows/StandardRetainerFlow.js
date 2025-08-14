import { jsx as _jsx } from "react/jsx-runtime";
import StandardRetainerForm from './StandardRetainerForm';
import { useRetainerState } from '../../hooks/useRetainerState';
export default function StandardRetainerFlow() {
    const { formData, updateField, errors, touched, markTouched, handleSubmit, } = useRetainerState();
    return (_jsx("div", { className: "flow-container", style: { padding: '2rem' }, children: _jsx("div", { className: "form-section", children: _jsx(StandardRetainerForm, { formData: formData, onChange: updateField, errors: errors, touched: touched, markTouched: markTouched, onSubmit: handleSubmit }) }) }));
}
