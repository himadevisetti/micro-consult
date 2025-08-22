// src/components/Inputs/CustomDatePicker.tsx

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

interface CustomDatePickerProps {
  id: string;
  value?: string; // ISO string: "2025-08-20"
  onChange: (newIso: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function CustomDatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  style,
}: CustomDatePickerProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value; // "2025-08-20"
    setInternalValue(raw);
    onChange(raw); // emit ISO string
  };

  const displayValue = value ? format(parseISO(value), 'MM/dd/yyyy') : '';

  return (
    <input
      id={id}
      type="date"
      value={internalValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder ?? displayValue}
      style={style}
    />
  );
}

