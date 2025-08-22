import { jsx as _jsx } from "react/jsx-runtime";
// src/components/Inputs/CustomDatePicker.tsx
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
export default function CustomDatePicker({ id, value, onChange, onBlur, placeholder, style, }) {
    const [internalValue, setInternalValue] = useState(value ?? '');
    const handleChange = (e) => {
        const raw = e.target.value; // "2025-08-20"
        setInternalValue(raw);
        onChange(raw); // emit ISO string
    };
    const displayValue = value ? format(parseISO(value), 'MM/dd/yyyy') : '';
    return (_jsx("input", { id: id, type: "date", value: internalValue, onChange: handleChange, onBlur: onBlur, placeholder: placeholder ?? displayValue, style: style }));
}
