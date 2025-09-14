// src/components/FormFlows/EmploymentAgreementForm.tsx

import React, { useRef, useState, useEffect } from 'react';
import {
  EmploymentAgreementFormData,
  defaultEmploymentAgreementFormData
} from '../../types/EmploymentAgreementFormData';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import { EmploymentAgreementFieldConfig } from '@/types/EmploymentAgreementFieldConfig';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
import { FormBlurHandler } from '@/types/FormUtils';

export interface EmploymentAgreementFormProps {
  schema: Record<string, EmploymentAgreementFieldConfig>;
  formData: EmploymentAgreementFormData;
  rawFormData: EmploymentAgreementFormData;
  errors?: Partial<Record<keyof EmploymentAgreementFormData, string>>;
  touched?: Partial<Record<keyof EmploymentAgreementFormData, boolean>>;
  onChange: (field: keyof EmploymentAgreementFormData, value: string | number | boolean | Date) => void;
  onRawChange: (field: keyof EmploymentAgreementFormData, value: string) => void;
  onBlur: FormBlurHandler<EmploymentAgreementFormData>;
  onSubmit?: (rawFormData: EmploymentAgreementFormData) => Promise<void>;
  markTouched?: (field: keyof EmploymentAgreementFormData) => void;
}

export default function EmploymentAgreementForm({
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
}: EmploymentAgreementFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof EmploymentAgreementFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const raw = e.target.value;
    const config = schema[field];

    let parsed: string | number | boolean = raw;

    if (config.type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      parsed = checked;
      onRawChange(field, checked ? 'true' : 'false');
      onChange(field, parsed);
      markTouched?.(field);
      return;
    }

    if (config.type === 'number') {
      parsed = raw === '' ? 0 : parseFloat(raw);
    }

    onRawChange(field, raw);
    onChange(field, parsed);
    markTouched?.(field);
  };

  const handleBlur = (field: keyof EmploymentAgreementFormData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onBlur(field, e.target.value);
    markTouched?.(field);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    Object.keys(schema).forEach((k) => {
      const key = k as keyof EmploymentAgreementFormData;
      markTouched?.(key);
    });

    try {
      await onSubmit?.(rawFormData);
    } catch (err) {
      console.error('[EmploymentAgreementForm] Submission failed:', err);
    }
  };

  useEffect(() => {
    const formEl = document.getElementById('employment-agreement-form');
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

  function getDefault<K extends keyof EmploymentAgreementFormData>(
    key: K,
    schema: Record<string, any>
  ): EmploymentAgreementFormData[K] {
    const fromSchema = schema[key]?.default as EmploymentAgreementFormData[K] | undefined;
    return fromSchema !== undefined ? fromSchema : defaultEmploymentAgreementFormData[key];
  }

  function toBool(val: unknown): boolean {
    return val === true || val === 'true' || val === 1 || val === '1';
  }

  const prevVisibilityRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const normalise = (v: unknown) =>
      v === undefined || v === null ? '' : String(v).trim().toLowerCase();

    Object.entries(schema).forEach(([key, config]) => {
      const field = key as keyof EmploymentAgreementFormData;
      const visible = !config.showIf || config.showIf(formData);
      const defaultVal = getDefault(field, schema);
      const prevVisible = prevVisibilityRef.current[field];

      if (
        visible &&
        prevVisible === false &&
        defaultVal !== undefined &&
        normalise(formData[field]) === ''
      ) {
        onRawChange(field, String(defaultVal));
        onChange(field, defaultVal as any);
      }

      if (!visible && prevVisible === true) {
        if (config.type === 'checkbox') {
          const defBool = toBool(defaultVal);
          const current = toBool(formData[field]);
          if (current !== defBool) {
            onRawChange(field, String(defBool));
            onChange(field, defBool);
          }
        } else {
          if (defaultVal !== undefined) {
            const currentVal = formData[field] as unknown;
            if (
              currentVal !== undefined &&
              currentVal !== '' &&
              normalise(currentVal) !== normalise(defaultVal)
            ) {
              onRawChange(field, '');
              onChange(field, '');
            }
          } else {
            if (formData[field] !== undefined && formData[field] !== '') {
              onRawChange(field, '');
              onChange(field, '');
            }
          }
        }
      }

      prevVisibilityRef.current[field] = visible;
    });
  }, [formData, schema, onChange, onRawChange]);

  const visibleFields = Object.entries(schema).filter(
    ([, cfg]) => !cfg.showIf || cfg.showIf(formData)
  );

  const groupOrder = { main: 1, clauses: 2 } as const;

  const sortedFields = [...visibleFields].sort((a, b) => {
    const groupDiff =
      groupOrder[(a[1].group ?? 'main')] - groupOrder[(b[1].group ?? 'main')];
    if (groupDiff !== 0) return groupDiff;

    if (a[1].group === 'clauses' && b[1].group === 'clauses') {
      const aDefaultTrue =
        (a[1].default as unknown) === true || (a[1].default as unknown) === 'true';
      const bDefaultTrue =
        (b[1].default as unknown) === true || (b[1].default as unknown) === 'true';
      if (aDefaultTrue !== bDefaultTrue) {
        return aDefaultTrue ? -1 : 1;
      }
    }

    return 0;
  });

  const rendered = new Set<string>();

  const renderField = (
    field: keyof EmploymentAgreementFormData,
    config: EmploymentAgreementFieldConfig,
    suppressLabel = false
  ) => {
    const value = formData[field];

    // Early return for checkboxes – matches StartupAdvisoryForm
    if (config.type === 'checkbox') {
      return (
        <label className={styles.clauseToggle}>
          <input
            id={field}
            type="checkbox"
            checked={value === true || value === 'true'}
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
      );
    }

    // Determine if the field is dependent on another field
    const isDependent = typeof config.showIf === 'function';

    return (
      <>
        {!suppressLabel && config.label && (
          <label htmlFor={field} className={styles.label}>
            {config.required === false && !isDependent ? (
              <>
                {config.label}
                <br />
                <span className={styles.optionalLabel}>(Optional)</span>
              </>
            ) : (
              config.label
            )}
          </label>
        )}

        {config.type === 'number' ? (
          <input
            id={field}
            type="number"
            step="0.01"
            value={typeof value === 'number' ? value : ''}
            onChange={handleChange(field)}
            onBlur={handleBlur(field)}
            placeholder={config.placeholder}
            className={styles.input}
          />
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
            <option value="">-- Select --</option>
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
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form
          id="employment-agreement-form"
          className={styles.formInner}
          onSubmit={handleFormSubmit}
        >
          {errors && Object.keys(errors).length > 0 && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}

          <h2 className={styles.formTitle}>
            📄 {RetainerTypeLabel[FormType.EmploymentAgreement]} Form
          </h2>

          {sortedFields.map(([key, config]) => {
            if (rendered.has(key)) return null;

            // Inline pair handling
            if (config.inlineWith) {
              const partnerKey = config.inlineWith as string;
              const partnerCfg = schema[partnerKey];
              if (partnerCfg) {
                rendered.add(key);
                rendered.add(partnerKey);

                const combinedErrorKey = `${key}__${partnerKey}`;
                const combinedError =
                  (errors as Record<string, string> | undefined)?.[combinedErrorKey];

                return (
                  <div key={key} className={styles.formRow}>
                    <label className={styles.label}>{config.label}</label>
                    <div className={styles.inlinePair}>
                      {renderField(key as keyof EmploymentAgreementFormData, config, true)}
                      {renderField(partnerKey as keyof EmploymentAgreementFormData, partnerCfg, true)}
                    </div>
                    {combinedError && (
                      <span className={styles.error}>{combinedError}</span>
                    )}
                  </div>
                );
              }
            }

            // Normal single field
            rendered.add(key);
            return (
              <div key={key} className={styles.formRow}>
                {renderField(key as keyof EmploymentAgreementFormData, config)}
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
