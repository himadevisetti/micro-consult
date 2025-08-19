import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { standardRetainerSchema } from '../../schemas/standardRetainerSchema';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
export default function StandardRetainerForm({ formData, rawFormData, errors, touched, onChange, onRawChange, onBlur, onSubmit, markTouched, }) {
    const handleChange = (field) => (e) => {
        const raw = e.target.value;
        const config = standardRetainerSchema[field];
        let parsed = raw;
        if (field === 'feeAmount' || field === 'retainerAmount') {
            parsed = raw === '' ? 0 : parseFloat(raw);
        }
        onRawChange(field, raw);
        onChange(field, parsed);
        markTouched?.(field);
    };
    const handleBlur = (field) => (e) => {
        onBlur(field, e.target.value);
        markTouched?.(field);
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        console.log('[StandardRetainerForm] Submitting rawFormData:', { ...rawFormData });
        try {
            await onSubmit?.(rawFormData);
        }
        catch (err) {
            console.error('[StandardRetainerForm] Submission failed:', err);
        }
    };
    const labelStyle = {
        width: '160px',
        fontWeight: 'bold',
        marginRight: '1rem',
    };
    const inputStyle = {
        flex: 1,
        padding: '0.5rem',
        paddingLeft: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1rem',
        backgroundColor: 'white',
    };
    return (_jsxs("form", { style: { maxWidth: '800px', margin: '0 auto' }, onSubmit: handleFormSubmit, children: [_jsxs("h2", { style: { fontSize: '1.5rem', marginBottom: '1.5rem' }, children: ["\uD83D\uDCDD ", RetainerTypeLabel[FormType.StandardRetainer], " Form"] }), Object.entries(standardRetainerSchema).map(([key, config]) => {
                const field = key;
                const value = formData[field];
                return (_jsxs("div", { style: { marginBottom: '1rem', display: 'flex', alignItems: 'center' }, children: [_jsx("label", { htmlFor: field, style: labelStyle, children: config.label }), field === 'feeAmount' || field === 'retainerAmount' ? (_jsxs("div", { style: { position: 'relative', flex: 1, display: 'flex' }, children: [_jsx("span", { style: {
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontWeight: 'bold',
                                        color: '#333',
                                    }, children: "$" }), _jsx("input", { id: field, type: "number", step: "0.01", value: typeof value === 'number' ? value : '', onChange: handleChange(field), onBlur: handleBlur(field), placeholder: config.placeholder, style: { ...inputStyle, paddingLeft: '1.5rem', width: '100%' } })] })) : config.type === 'date' ? (_jsx("input", { id: field, type: "date", value: rawFormData[field] || '', onChange: handleChange(field), onBlur: handleBlur(field), placeholder: config.placeholder, style: inputStyle })) : config.type === 'textarea' ? (_jsx("textarea", { id: field, value: value, onChange: handleChange(field), onBlur: handleBlur(field), placeholder: config.placeholder, style: { ...inputStyle, minHeight: '100px' } })) : config.type === 'dropdown' && config.options ? (_jsx("select", { id: field, value: value, onChange: handleChange(field), onBlur: handleBlur(field), style: inputStyle, children: config.options.map((opt) => (_jsx("option", { value: opt, children: opt }, opt))) })) : (_jsx("input", { id: field, type: config.type, value: value, onChange: handleChange(field), onBlur: handleBlur(field), placeholder: config.placeholder, style: inputStyle })), touched?.[field] && errors?.[field] && (_jsx("span", { style: { color: 'red', fontSize: '0.875rem', marginLeft: '1rem' }, children: errors[field] }))] }, field));
            }), _jsx("div", { style: { textAlign: 'center', marginTop: '2rem' }, children: _jsx("button", { type: "submit", style: { padding: '0.5rem 1.25rem', fontSize: '1rem', borderRadius: '4px' }, children: "Submit" }) })] }));
}
