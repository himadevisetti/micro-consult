// src/components/FormFlows/StandardRetainerForm.tsx

import React from 'react';
import { standardRetainerSchema } from '../../schemas/standardRetainerSchema';
import type { RetainerFormData } from '../../types/RetainerFormData';
import { FormType, RetainerTypeLabel } from '@/types/FormType';

export interface StandardRetainerFormProps {
  formData: RetainerFormData;
  errors?: Partial<Record<keyof RetainerFormData, string>>;
  touched?: Partial<Record<keyof RetainerFormData, boolean>>;
  onChange: (field: keyof RetainerFormData, value: string | number | Date) => void;
  onSubmit?: () => void;
  markTouched?: (field: keyof RetainerFormData) => void;
}

export default function StandardRetainerForm({
  formData,
  errors,
  touched,
  onChange,
  onSubmit,
  markTouched,
}: StandardRetainerFormProps) {
  const handleChange = (field: keyof RetainerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const raw = e.target.value;
    const config = standardRetainerSchema[field];

    let parsed: string | number = raw;
    if (field === 'feeAmount' || field === 'retainerAmount') {
      parsed = raw === '' ? 0 : parseFloat(raw);
    }

    onChange(field, parsed);
    markTouched?.(field);
  };

  const handleDateChange = (field: keyof RetainerFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange(field, date);
      markTouched?.(field);
    }
  };

  const labelStyle: React.CSSProperties = {
    width: '160px',
    fontWeight: 'bold',
    marginRight: '1rem',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.5rem',
    paddingLeft: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white',
  };

  return (
    <form
      style={{ maxWidth: '800px', margin: '0 auto' }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        📝 {RetainerTypeLabel[FormType.StandardRetainer]} Form
      </h2>

      {Object.entries(standardRetainerSchema).map(([key, config]) => {
        const field = key as keyof RetainerFormData;
        const value = formData[field];

        return (
          <div key={field} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <label htmlFor={field} style={labelStyle}>
              {config.label}
            </label>

            {field === 'feeAmount' || field === 'retainerAmount' ? (
              <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 'bold',
                    color: '#333',
                  }}
                >
                  $
                </span>
                <input
                  id={field}
                  type="number"
                  step="0.01"
                  value={typeof value === 'number' ? value : ''}
                  onChange={handleChange(field)}
                  onBlur={() => markTouched?.(field)}
                  placeholder={config.placeholder}
                  style={{ ...inputStyle, paddingLeft: '1.5rem', width: '100%' }}
                />
              </div>
            ) : config.type === 'date' ? (
              <input
                id={field}
                type="date"
                value={value instanceof Date ? value.toISOString().split('T')[0] : ''}
                onChange={handleDateChange(field)}
                onBlur={() => markTouched?.(field)}
                placeholder={config.placeholder}
                style={inputStyle}
              />
            ) : config.type === 'textarea' ? (
              <textarea
                id={field}
                value={value as string}
                onChange={handleChange(field)}
                onBlur={() => markTouched?.(field)}
                placeholder={config.placeholder}
                style={{ ...inputStyle, minHeight: '100px' }}
              />
            ) : config.type === 'dropdown' && config.options ? (
              <select
                id={field}
                value={value as string}
                onChange={handleChange(field)}
                onBlur={() => markTouched?.(field)}
                style={inputStyle}
              >
                {config.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field}
                type={config.type}
                value={value as string}
                onChange={handleChange(field)}
                onBlur={() => markTouched?.(field)}
                placeholder={config.placeholder}
                style={inputStyle}
              />
            )}

            {touched?.[field] && errors?.[field] && (
              <span style={{ color: 'red', fontSize: '0.875rem', marginLeft: '1rem' }}>
                {errors[field]}
              </span>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button type="submit" style={{ padding: '0.5rem 1.25rem', fontSize: '1rem', borderRadius: '4px' }}>
          Submit
        </button>
      </div>
    </form>
  );
}
