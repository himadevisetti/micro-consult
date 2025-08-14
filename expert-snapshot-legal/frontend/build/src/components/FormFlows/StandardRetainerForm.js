import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { standardRetainerSchema } from '../../schemas/standardRetainerSchema';
export default function StandardRetainerForm({ formData, errors, touched, onChange, onSubmit, markTouched, }) {
    const handleChange = (field) => (e) => {
        const raw = e.target.value;
        const config = standardRetainerSchema[field];
        let parsed = raw;
        if (field === 'feeAmount' || field === 'retainerAmount') {
            parsed = raw === '' ? 0 : parseFloat(raw);
        }
        onChange(field, parsed);
        markTouched?.(field);
    };
    const handleDateChange = (field) => (e) => {
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) {
            onChange(field, date);
            markTouched?.(field);
        }
    };
    return (_jsxs("form", { style: { maxWidth: '600px', margin: '0 auto' }, onSubmit: (e) => {
            e.preventDefault();
            onSubmit?.();
        }, children: [_jsx("h2", { style: { fontSize: '1.5rem', marginBottom: '1rem' }, children: "\uD83D\uDCDD Standard Legal Retainer Form" }), Object.entries(standardRetainerSchema).map(([key, config]) => {
                const field = key;
                const value = formData[field];
                return (_jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { htmlFor: field, style: { display: 'block', marginBottom: '0.25rem' }, children: config.label }), field === 'feeAmount' || field === 'retainerAmount' ? (_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#fff',
                                width: '100%',
                                maxWidth: '300px',
                            }, children: [_jsx("span", { style: { fontWeight: 'bold', color: '#333', marginRight: '0.25rem' }, children: "$" }), _jsx("input", { id: field, type: "number", step: "0.01", value: typeof value === 'number' ? value : '', onChange: handleChange(field), onBlur: () => markTouched?.(field), placeholder: config.placeholder, style: {
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                    } })] })) : config.type === 'date' ? (_jsx("input", { id: field, type: "date", value: value instanceof Date ? value.toISOString().split('T')[0] : '', onChange: handleDateChange(field), onBlur: () => markTouched?.(field), placeholder: config.placeholder, style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            } })) : config.type === 'textarea' ? (_jsx("textarea", { id: field, value: value, onChange: handleChange(field), onBlur: () => markTouched?.(field), placeholder: config.placeholder, style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                minHeight: '100px',
                            } })) : config.type === 'dropdown' && config.options ? (_jsx("select", { id: field, value: value, onChange: handleChange(field), onBlur: () => markTouched?.(field), style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }, children: config.options.map((opt) => (_jsx("option", { value: opt, children: opt }, opt))) })) : (_jsx("input", { id: field, type: config.type, value: value, onChange: handleChange(field), onBlur: () => markTouched?.(field), placeholder: config.placeholder, style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            } })), touched?.[field] && errors?.[field] && (_jsx("span", { style: { color: 'red', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }, children: errors[field] }))] }, field));
            }), _jsx("button", { type: "submit", style: { padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '4px' }, children: "Submit" })] }));
}
