import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { standardRetainerSchema } from '../../schemas/standardRetainerSchema';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import { getDateInputValue } from '../../utils/formRenderUtils';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
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
        try {
            await onSubmit?.(rawFormData);
        }
        catch (err) {
            console.error('[StandardRetainerForm] Submission failed:', err);
        }
    };
    return (_jsx("div", { className: styles.pageContainer, children: _jsx("div", { className: styles.formWrapper, children: _jsxs("form", { className: styles.formInner, onSubmit: handleFormSubmit, children: [_jsxs("h2", { className: styles.formTitle, children: ["\uD83D\uDCDD ", RetainerTypeLabel[FormType.StandardRetainer], " Form"] }), Object.entries(standardRetainerSchema).map(([key, config]) => {
                        const field = key;
                        const value = formData[field];
                        return (_jsxs("div", { className: styles.formRow, children: [_jsx("label", { htmlFor: field, className: styles.label, children: field === 'retainerAmount' ? (_jsxs(_Fragment, { children: ["Retainer Amount", _jsx("br", {}), _jsx("span", { className: styles.optionalLabel, children: "(Optional)" })] })) : (config.label) }), field === 'feeAmount' || field === 'retainerAmount' ? (_jsxs("div", { className: styles.currencyInputWrapper, children: [_jsx("span", { className: styles.dollarPrefix, children: "$" }), _jsx("input", { id: field, type: "number", step: "0.01", value: typeof value === 'number' ? value : '', onChange: handleChange(field), onBlur: handleBlur(field), placeholder: config.placeholder, className: `${styles.input} ${styles.inputWithPrefix}` })] })) : config.type === 'date' ? ((() => {
                                    const isoValue = getDateInputValue(rawFormData[field]);
                                    return (_jsx(CustomDatePicker, { id: field, value: rawFormData[field], onChange: (newIso) => {
                                            onRawChange(field, newIso);
                                            onChange(field, newIso);
                                            markTouched?.(field);
                                        }, onBlur: () => {
                                            const safeValue = rawFormData[field] ?? '';
                                            onBlur(field, safeValue);
                                            markTouched?.(field);
                                        }, placeholder: config.placeholder, className: styles.input, style: { flex: 1 } }));
                                })()) : config.type === 'textarea' ? (_jsx("textarea", { id: field, value: value, onChange: handleChange(field), onBlur: handleBlur(field), placeholder: config.placeholder, className: `${styles.input} ${styles.textarea}` })) : config.type === 'dropdown' && config.options ? (_jsx("select", { id: field, value: value, onChange: handleChange(field), onBlur: handleBlur(field), className: styles.select, children: config.options.map((opt) => (_jsx("option", { value: opt, children: opt }, opt))) })) : (_jsx("input", { id: field, type: config.type, value: value, onChange: handleChange(field), onBlur: handleBlur(field), placeholder: config.placeholder, className: styles.input })), touched?.[field] && errors?.[field] && (_jsx("span", { className: styles.error, children: errors[field] }))] }, field));
                    }), _jsx("div", { className: styles.submitRow, children: _jsx("button", { type: "submit", className: styles.submitButton, children: "Submit" }) })] }) }) }));
}
