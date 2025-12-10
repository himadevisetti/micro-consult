// src/components/FormFlows/LitigationEngagementForm.tsx

import React, { useState, useEffect } from 'react';
import type { LitigationEngagementFormData } from '../../types/LitigationEngagementFormData';
import { FormType, RetainerTypeLabel, getFormDomId } from '@/types/FormType';
import { LitigationEngagementFieldConfig } from '@/types/LitigationEngagementFieldConfig';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
import { FormBlurHandler } from '@/types/FormUtils';
import SubmitButton from '../../utils/SubmitButton';
import { focusFirstError } from '@/utils/focusFirstError';

export interface LitigationEngagementFormProps {
  schema: Record<string, LitigationEngagementFieldConfig>;
  formData: LitigationEngagementFormData;
  rawFormData: LitigationEngagementFormData;
  errors?: Partial<Record<keyof LitigationEngagementFormData, string>>;
  touched?: Partial<Record<keyof LitigationEngagementFormData, boolean>>;
  onChange: (field: keyof LitigationEngagementFormData, value: string | number | boolean | Date) => void;
  onRawChange: (field: keyof LitigationEngagementFormData, value: string) => void;
  onBlur: FormBlurHandler<LitigationEngagementFormData>;
  onSubmit?: (rawFormData: LitigationEngagementFormData) => Promise<void>;
  markTouched?: (field: keyof LitigationEngagementFormData) => void;
}

export default function LitigationEngagementForm({
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
}: LitigationEngagementFormProps) {
  const formId = getFormDomId(FormType.LitigationEngagement);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof LitigationEngagementFormData) => (
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

  const handleBlur = (field: keyof LitigationEngagementFormData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onBlur(field, e.target.value);
    markTouched?.(field);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    Object.keys(schema).forEach((k) => {
      const key = k as keyof LitigationEngagementFormData;
      markTouched?.(key);
    });

    try {
      await onSubmit?.(rawFormData);
    } catch (err) {
      console.error('[LitigationEngagementForm] Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- focus logic: first error OR first editable field
  useEffect(() => {
    const formEl = document.getElementById(formId);
    if (!formEl) return;

    if (errors && Object.keys(errors).length > 0) {
      // Always focus the first invalid field when errors change
      focusFirstError(formId, errors as Record<string, string>);
    } else {
      // On mount (no errors yet) → focus the first editable field
      const editable = formEl.querySelector<HTMLElement>(
        'input[name]:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea[name]:not([disabled]), select[name]:not([disabled])'
      );
      editable?.focus();
    }
  }, [errors, formId]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form id={formId} className={styles.formInner} onSubmit={handleFormSubmit}>
          {errors && Object.keys(errors).length > 0 && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}
          <h2 className={styles.formTitle}>
            ⚖️ {RetainerTypeLabel[FormType.LitigationEngagement]} Form
          </h2>

          {Object.entries(schema).map(([key, config]) => {
            const field = key as keyof LitigationEngagementFormData;
            const value = formData[field];

            return (
              <div key={field} className={styles.formRow}>
                {config.type === 'checkbox' ? (
                  <label className={styles.clauseToggle}>
                    <input
                      id={field}
                      name={field}
                      type="checkbox"
                      checked={!!value}
                      onChange={handleChange(field)}
                      onBlur={() => {
                        onBlur(field, value as string);
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
                      {field === 'retainerAmount' || field === 'limitationsOfRepresentation' ? (
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
                          name={field}
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
                            name={field}
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
                        name={field}
                        value={value as string}
                        onChange={handleChange(field)}
                        onBlur={handleBlur(field)}
                        placeholder={config.placeholder}
                        className={`${styles.input} ${styles.textarea}`}
                      />
                    ) : config.type === 'dropdown' && config.options ? (
                      <select
                        id={field}
                        name={field}
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
                        name={field}
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
            <SubmitButton submitting={submitting} label="Submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
