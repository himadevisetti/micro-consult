// src/components/Inputs/GenericInlinePairFieldRenderer.tsx

import React, { useEffect } from 'react';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
import { InlinePairField } from '../../types/FamilyLawAgreementFieldConfig';

interface GenericInlinePairFieldRendererProps<TFormData> {
  field: keyof TFormData;
  value: any[];
  config: { pair?: InlinePairField[]; label?: string; required?: boolean };
  errors?: Record<string, string | undefined>;
  onChange: (field: keyof TFormData) => (e: any) => void;
}

export default function GenericInlinePairFieldRenderer<TFormData>({
  field,
  value,
  config,
  errors,
  onChange,
}: GenericInlinePairFieldRendererProps<TFormData>) {
  const pair = Array.isArray(config.pair) ? config.pair : [];

  // Initialize one row if required and empty
  useEffect(() => {
    if (config.required && Array.isArray(value) && value.length === 0) {
      const defaultRow = pair.reduce((acc, f) => {
        acc[f.key] = '';
        return acc;
      }, {} as Record<string, string>);
      onChange(field)({ target: { value: [defaultRow] } } as any);
    }
  }, []);

  const getError = (key: string) => errors?.[key];

  const handleAddRow = () => {
    const newRow = pair.reduce((acc, f) => {
      acc[f.key] = '';
      return acc;
    }, {} as Record<string, string>);
    const updated = [...(Array.isArray(value) ? value : []), newRow];
    onChange(field)({ target: { value: updated } } as any);
  };

  const handleRemoveRow = (idx: number) => {
    const updated = value.filter((_, i) => i !== idx);
    onChange(field)({ target: { value: updated } } as any);
  };

  return (
    <div className={styles.inlinePairBlock}>
      {(Array.isArray(value) ? value : []).map((entry, idx) => (
        <div key={idx} className={styles.inlinePair}>
          {pair.map((f) => {
            const fieldKey = `${String(field)}_row_${idx}_${f.key}`;
            const error = getError(fieldKey);

            return f.type === 'date' ? (
              <CustomDatePicker
                key={fieldKey}
                id={fieldKey}
                name={fieldKey}
                value={entry[f.key] || ''}
                onChange={(newIso: string) => {
                  const updated = [...value];
                  updated[idx] = { ...updated[idx], [f.key]: newIso };
                  onChange(field)({ target: { value: updated } } as any);
                }}
                placeholder={f.placeholder}
                className={styles.input}
              />
            ) : (
              <input
                key={fieldKey}
                id={fieldKey}
                name={fieldKey}
                type={f.type}
                value={entry[f.key] || ''}
                onChange={(e) => {
                  const updated = [...value];
                  updated[idx] = { ...updated[idx], [f.key]: e.target.value };
                  onChange(field)({ target: { value: updated } } as any);
                }}
                placeholder={f.placeholder}
                className={styles.input}
              />
            );
          })}

          {value.length > 1 && (
            <button
              type="button"
              className={styles.removeRowButton}
              onClick={() => handleRemoveRow(idx)}
              aria-label={`Remove row ${idx + 1}`}
            >
              ✖
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={handleAddRow}>
        + Add Row
      </button>
    </div>
  );
}
