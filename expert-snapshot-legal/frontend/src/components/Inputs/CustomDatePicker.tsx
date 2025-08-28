// src/components/Inputs/CustomDatePicker.tsx
import React, { useEffect, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  // sync when parent value changes (e.g., back navigation rehydration)
  useEffect(() => {
    setInternalValue(value ?? '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value; // "YYYY-MM-DD"
    setInternalValue(raw);
    onChange(raw);
  };

  const openPicker = () => {
    const el = inputRef.current;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) return; // Let Safari handle it natively
    // Chromium: showPicker opens the native dialog
    if (el && 'showPicker' in el && typeof (el as any).showPicker === 'function') {
      (el as any).showPicker();
    } else {
      // Fallback: focus + click to nudge native behavior
      el?.focus();
      el?.click();
    }
  };

  const displayValue = value ? format(parseISO(value), 'MM/dd/yyyy') : '';

  return (
    <div className={styles.dateInputWrapper} style={style}>
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={internalValue}
        onChange={handleChange}
        onBlur={onBlur}
        // Don’t rely on placeholder for type=date; keep it harmless
        placeholder={placeholder ?? displayValue}
        className={`${styles.input} ${className ?? ''}`}
        style={{ paddingRight: '2rem' }}
        // Ensure clicking the input opens the picker even if the indicator is hidden by CSS
        onClick={openPicker}
      />
      {/* Use mousedown to avoid blurring the input before we open the picker */}
      <span
        className={styles.calendarIcon}
        aria-hidden="true"
        onMouseDown={(e) => {
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if (isSafari) return; // Let Safari handle it natively
          e.preventDefault();
          openPicker();
        }}
      />
    </div>
  );
}
