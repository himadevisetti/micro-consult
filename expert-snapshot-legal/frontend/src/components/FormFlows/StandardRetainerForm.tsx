// src/components/FormFlows/StandardRetainerForm.tsx

import React, { useState, useEffect } from 'react';
import type { RetainerFormData } from '../../types/RetainerFormData';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import { RetainerFieldConfig } from '@/types/RetainerFieldConfig';
import { getDateInputValue } from '../../utils/formRenderUtils';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';

export interface StandardRetainerFormProps {
  schema: Record<string, RetainerFieldConfig>;
  formData: RetainerFormData;
  rawFormData: RetainerFormData;
  errors?: Partial<Record<keyof RetainerFormData, string>>;
  touched?: Partial<Record<keyof RetainerFormData, boolean>>;
  onChange: (field: keyof RetainerFormData, value: string | number | Date) => void;
  onRawChange: (field: keyof RetainerFormData, value: string) => void;
  onBlur: (field: keyof RetainerFormData, value: string) => void;
  onSubmit?: (rawFormData: RetainerFormData) => Promise<void>;
  markTouched?: (field: keyof RetainerFormData) => void;
}

export default function StandardRetainerForm({
  schema,
  formData,
  rawFormData,
  errors,
  touched,
  onChange,
  onRawChange,
  onBlur,
  onSubmit,
  markTouched,
}: StandardRetainerFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof RetainerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const raw = e.target.value;
    const config = schema[field];

    let parsed: string | number = raw;
    if (field === 'feeAmount' || field === 'retainerAmount') {
      parsed = raw === '' ? 0 : parseFloat(raw);
    }

    onRawChange(field, raw);
    onChange(field, parsed);
    markTouched?.(field);
  };

  const handleBlur = (field: keyof RetainerFormData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onBlur(field, e.target.value);
    markTouched?.(field);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    Object.keys(schema).forEach((k) => {
      const key = k as keyof RetainerFormData;
      markTouched?.(key);
    });

    try {
      await onSubmit?.(rawFormData);
    } catch (err) {
      console.error('[StandardRetainerForm] Submission failed:', err);
    }
  };

  useEffect(() => {
    const formEl = document.getElementById('standard-retainer-form');
    if (!formEl) return;

    const editable = formEl.querySelector(
      'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])'
    ) as HTMLElement | null;

    editable?.focus();
  }, []);

  useEffect(() => {
    if (!submitted || !errors || Object.keys(errors).length === 0) return;

    const firstErrorField = Object.keys(errors)[0];
    const el = document.getElementById(firstErrorField);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setSubmitted(false);
  }, [submitted, errors]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form id="standard-retainer-form" className={styles.formInner} onSubmit={handleFormSubmit}>
          {errors && Object.keys(errors).length > 0 && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}
          <h2 className={styles.formTitle}>
            📝 {RetainerTypeLabel[FormType.StandardRetainer]} Form
          </h2>

          {Object.entries(schema).map(([key, config]) => {
            const field = key as keyof RetainerFormData;
            const value = formData[field];

            return (
              <div key={field} className={styles.formRow}>
                <label htmlFor={field} className={styles.label}>
                  {field === 'retainerAmount' || field === 'matterDescription' ? (
                    <>
                      {config.label}
                      <br />
                      <span className={styles.optionalLabel}>(Optional)</span>
                    </>
                  ) : (
                    config.label
                  )}
                </label>

                {field === 'feeAmount' || field === 'retainerAmount' ? (
                  <div className={styles.currencyInputWrapper}>
                    <span className={styles.dollarPrefix}>$</span>
                    <input
                      id={field}
                      type="number"
                      step="0.01"
                      value={typeof value === 'number' ? value : ''}
                      onChange={handleChange(field)}
                      onBlur={handleBlur(field)}
                      placeholder={config.placeholder}
                      className={`${styles.input} ${styles.inputWithPrefix}`}
                    />
                  </div>
                ) : config.type === 'date' ? (
                  (() => {
                    const isoValue = getDateInputValue(rawFormData[field]);
                    return (
                      <CustomDatePicker
                        id={field}
                        value={rawFormData[field]}
                        onChange={(newIso: string) => {
                          onRawChange(field, newIso);
                          onChange(field, newIso);
                          markTouched?.(field);
                        }}
                        onBlur={() => {
                          const safeValue = rawFormData[field] ?? '';
                          onBlur(field, safeValue);
                          markTouched?.(field);
                        }}
                        placeholder={config.placeholder}
                        className={styles.input}
                        style={{ flex: 1 }}
                      />
                    );
                  })()
                ) : config.type === 'textarea' ? (
                  <textarea
                    id={field}
                    value={value as string}
                    onChange={handleChange(field)}
                    onBlur={handleBlur(field)}
                    placeholder={config.placeholder}
                    className={`${styles.input} ${styles.textarea}`}
                  />
                ) : config.type === 'dropdown' && config.options ? (
                  <select
                    id={field}
                    value={value as string}
                    onChange={handleChange(field)}
                    onBlur={handleBlur(field)}
                    className={styles.select}
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
                    onBlur={handleBlur(field)}
                    placeholder={config.placeholder}
                    className={styles.input}
                  />
                )}

                {submitted || touched?.[field] && errors?.[field] && (
                  <span className={styles.error}>{errors[field]}</span>
                )}
              </div>
            );
          })}

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
