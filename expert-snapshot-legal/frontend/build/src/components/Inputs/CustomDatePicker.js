import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Inputs/CustomDatePicker.tsx
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import styles from '../../styles/StandardRetainerForm.module.css';
export default function CustomDatePicker({ id, value, onChange, onBlur, placeholder, style, className, }) {
    const [internalValue, setInternalValue] = useState(value ?? '');
    const handleChange = (e) => {
        const raw = e.target.value; // "2025-08-20"
        setInternalValue(raw);
        onChange(raw); // emit ISO string
    };
    const displayValue = value ? format(parseISO(value), 'MM/dd/yyyy') : '';
    return (_jsxs("div", { className: styles.dateInputWrapper, children: [_jsx("input", { id: id, type: "date", value: internalValue, onChange: handleChange, onBlur: onBlur, placeholder: placeholder ?? displayValue, className: `${styles.input} ${className}`, style: { paddingRight: '2rem' } }), _jsx("span", { className: "calendarIcon" })] }));
}
