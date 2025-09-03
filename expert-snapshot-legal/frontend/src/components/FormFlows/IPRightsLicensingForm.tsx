// src/components/FormFlows/IPRightsLicensingForm.tsx

import React, { useState, useEffect } from 'react';
import type { IPRightsLicensingFormData } from '../../types/IPRightsLicensingFormData';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import { IPRetainerFieldConfig } from '@/types/IPRetainerFieldConfig';
import { getDateInputValue } from '../../utils/formRenderUtils';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
import { FormBlurHandler } from '@/types/FormUtils';

export interface IPRightsLicensingFormProps {
  schema: Record<string, IPRetainerFieldConfig>;
  formData: IPRightsLicensingFormData;
  rawFormData: IPRightsLicensingFormData;
  errors?: Partial<Record<keyof IPRightsLicensingFormData, string>>;
  touched?: Partial<Record<keyof IPRightsLicensingFormData, boolean>>;
  onChange: (field: keyof IPRightsLicensingFormData, value: string | number | boolean | Date) => void;
  onRawChange: (field: keyof IPRightsLicensingFormData, value: string) => void;
  onBlur: FormBlurHandler<IPRightsLicensingFormData>;
  onSubmit?: (rawFormData: IPRightsLicensingFormData) => Promise<void>;
  markTouched?: (field: keyof IPRightsLicensingFormData) => void;
}

export default function IPRightsLicensingForm({
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
}: IPRightsLicensingFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof IPRightsLicensingFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const raw = e.target.value;
    const config = schema[field];

    let parsed: string | number | boolean = raw;
    if (config.type === 'checkbox') {
      parsed = (e.target as HTMLInputElement).checked;
    } else if (field === 'feeAmount' || field === 'retainerAmount') {
      parsed = raw === '' ? 0 : parseFloat(raw);
    }

    onRawChange(field, raw);
    onChange(field, parsed);
    markTouched?.(field);
  };

  const handleBlur = (field: keyof IPRightsLicensingFormData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onBlur(field, e.target.value);
    markTouched?.(field);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    Object.keys(schema).forEach((k) => {
      const key = k as keyof IPRightsLicensingFormData;
      markTouched?.(key);
    });

    try {
      await onSubmit?.(rawFormData);
    } catch (err) {
      console.error('[IPRightsLicensingForm] Submission failed:', err);
    }
  };

  useEffect(() => {
    const formEl = document.getElementById('ip-rights-licensing-form');
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
        <form id="ip-rights-licensing-form" className={styles.formInner} onSubmit={handleFormSubmit}>
          {errors && Object.keys(errors).length > 0 && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}
          <h2 className={styles.formTitle}>
            🧠 {RetainerTypeLabel[FormType.IPRightsLicensing]} Form
          </h2>

          {Object.entries(schema).map(([key, config]) => {
            const field = key as keyof IPRightsLicensingFormData;
            const value = formData[field];

            return (
              <div key={field} className={styles.formRow}>
                {config.type === 'checkbox' ? (
                  <label className={styles.clauseToggle}>
                    <input
                      id={field}
                      type="checkbox"
                      checked={!!value}
                      onChange={handleChange(field)}
                      onBlur={() => {
                        onBlur(field, value);
                        markTouched?.(field);
                      }}
                    />
                    {config.label}
                    {(submitted || touched?.[field]) && errors?.[field] && (
                      <span className={styles.error}>{errors[field]}</span>
                    )}
                  </label>
                ) : (
                  <>
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
                        const rawValue = rawFormData[field];
                        return (
                          <CustomDatePicker
                            id={field}
                            value={typeof rawValue === 'string' ? rawValue : ''}
                            onChange={(newIso: string) => {
                              onRawChange(field, newIso);
                              onChange(field, newIso);
                              markTouched?.(field);
                            }}
                            onBlur={() => {
                              const safeValue = typeof rawValue === 'string' ? rawValue : '';
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

                    {(submitted || touched?.[field]) && errors?.[field] && (
                      <span className={styles.error}>{errors[field]}</span>
                    )}
                  </>
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
