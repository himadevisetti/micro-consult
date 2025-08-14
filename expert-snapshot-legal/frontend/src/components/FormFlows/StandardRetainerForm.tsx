// src/components/FormFlows/StandardRetainerForm.tsx
import React from 'react';
import { standardRetainerSchema } from '../../schemas/standardRetainerSchema';
import type { RetainerFormData } from '../../types/RetainerFormData';

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

  return (
    <form
      style={{ maxWidth: '600px', margin: '0 auto' }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📝 Standard Legal Retainer Form</h2>

      {Object.entries(standardRetainerSchema).map(([key, config]) => {
        const field = key as keyof RetainerFormData;
        const value = formData[field];

        return (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label htmlFor={field} style={{ display: 'block', marginBottom: '0.25rem' }}>
              {config.label}
            </label>

            {field === 'feeAmount' || field === 'retainerAmount' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#fff',
                  width: '100%',
                  maxWidth: '300px',
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#333', marginRight: '0.25rem' }}>$</span>
                <input
                  id={field}
                  type="number"
                  step="0.01"
                  value={typeof value === 'number' ? value : ''}
                  onChange={handleChange(field)}
                  onBlur={() => markTouched?.(field)}
                  placeholder={config.placeholder}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '1rem',
                    width: '100%',
                    backgroundColor: 'transparent',
                  }}
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
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            ) : config.type === 'textarea' ? (
              <textarea
                id={field}
                value={value as string}
                onChange={handleChange(field)}
                onBlur={() => markTouched?.(field)}
                placeholder={config.placeholder}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  minHeight: '100px',
                }}
              />
            ) : config.type === 'dropdown' && config.options ? (
              <select
                id={field}
                value={value as string}
                onChange={handleChange(field)}
                onBlur={() => markTouched?.(field)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
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
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            )}

            {touched?.[field] && errors?.[field] && (
              <span style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {errors[field]}
              </span>
            )}
          </div>
        );
      })}

      <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '4px' }}>
        Submit
      </button>
    </form>
  );
}
