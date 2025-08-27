// src/components/Inputs/CustomDatePicker.tsx

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import styles from '../../styles/StandardRetainerForm.module.css';

interface CustomDatePickerProps {
  id: string;
  value?: string; // ISO string: "2025-08-20"
  onChange: (newIso: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function CustomDatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  style,
  className,
}: CustomDatePickerProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value; // "2025-08-20"
    setInternalValue(raw);
    onChange(raw); // emit ISO string
  };

  const displayValue = value ? format(parseISO(value), 'MM/dd/yyyy') : '';

  return (
    <div className={styles.dateInputWrapper}>
      <input
        id={id}
        type="date"
        value={internalValue}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder ?? displayValue}
        className={`${styles.input} ${className}`}
        style={{ paddingRight: '2rem' }}
      />
      <span className="calendarIcon" />
    </div>
  );
}

