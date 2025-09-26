// src/components/FormFlows/StartupAdvisoryForm.tsx

import React, { useRef, useState, useEffect } from 'react';
import { StartupAdvisoryFormData, defaultStartupAdvisoryFormData } from '../../types/StartupAdvisoryFormData';
import { FormType, RetainerTypeLabel, getFormDomId } from '@/types/FormType';
import { StartupAdvisoryFieldConfig } from '@/types/StartupAdvisoryFieldConfig';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
import { FormBlurHandler } from '@/types/FormUtils';
import { focusFirstError } from '@/utils/focusFirstError';

export interface StartupAdvisoryFormProps {
  schema: Record<string, StartupAdvisoryFieldConfig>;
  formData: StartupAdvisoryFormData;
  rawFormData: StartupAdvisoryFormData;
  errors?: Partial<Record<keyof StartupAdvisoryFormData, string>>;
  touched?: Partial<Record<keyof StartupAdvisoryFormData, boolean>>;
  onChange: (field: keyof StartupAdvisoryFormData, value: string | number | boolean | Date) => void;
  onRawChange: (field: keyof StartupAdvisoryFormData, value: string) => void;
  onBlur: FormBlurHandler<StartupAdvisoryFormData>;
  onSubmit?: (rawFormData: StartupAdvisoryFormData) => Promise<void>;
  markTouched?: (field: keyof StartupAdvisoryFormData) => void;
}

export default function StartupAdvisoryForm({
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
}: StartupAdvisoryFormProps) {
  const formId = getFormDomId(FormType.StartupAdvisory);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof StartupAdvisoryFormData) => (
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

  const handleBlur = (field: keyof StartupAdvisoryFormData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onBlur(field, e.target.value);
    markTouched?.(field);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    Object.keys(schema).forEach((k) => {
      const key = k as keyof StartupAdvisoryFormData;
      markTouched?.(key);
    });

    try {
      await onSubmit?.(rawFormData);
    } catch (err) {
      console.error('[StartupAdvisoryForm] Submission failed:', err);
    }
  };

  useEffect(() => {
    const formEl = document.getElementById(formId);
    if (!formEl) return;

    if (errors && Object.keys(errors).length > 0) {
      // Validation errors exist → focus the first invalid field(s)
      focusFirstError(formId, errors);
    } else {
      // First mount (no errors yet) → focus the first editable field
      const editable = formEl.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])'
      );
      editable?.focus();
    }
  }, [errors]);

  // --- helper: strongly-typed default reader
  function getDefault<K extends keyof StartupAdvisoryFormData>(
    key: K,
    schema: Record<string, any>
  ): StartupAdvisoryFormData[K] {
    const fromSchema = schema[key]?.default as StartupAdvisoryFormData[K] | undefined;
    return fromSchema !== undefined ? fromSchema : defaultStartupAdvisoryFormData[key];
  }

  // --- helper: robust boolean coercion for checkbox fields
  function toBool(val: unknown): boolean {
    return val === true || val === 'true' || val === 1 || val === '1';
  }

  const prevVisibilityRef = useRef<Record<string, boolean>>({});

  // --- effect: preserve defaults when fields are hidden via showIf
  useEffect(() => {
    const normalise = (v: unknown) =>
      v === undefined || v === null ? '' : String(v).trim().toLowerCase();

    Object.entries(schema).forEach(([key, config]) => {
      const field = key as keyof StartupAdvisoryFormData;
      const visible = !config.showIf || config.showIf(formData);
      const defaultVal = getDefault(field, schema);
      const prevVisible = prevVisibilityRef.current[field];

      // Only set default on hidden → visible
      if (
        visible &&
        prevVisible === false &&
        defaultVal !== undefined &&
        normalise(formData[field]) === ''
      ) {
        onRawChange(field, String(defaultVal));
        onChange(field, defaultVal as any);
      }

      // Only run hidden-field logic on visible → hidden
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

      // Update previous visibility
      prevVisibilityRef.current[field] = visible;
    });
  }, [formData, schema, onChange, onRawChange]);

  const visibleFields = Object.entries(schema).filter(
    ([, cfg]) => !cfg.showIf || cfg.showIf(formData)
  );

  const groupOrder = { main: 1, clauses: 2 } as const;

  const sortedFields = [...visibleFields].sort((a, b) => {
    // Primary sort: by group order
    const groupDiff =
      groupOrder[(a[1].group ?? 'main')] - groupOrder[(b[1].group ?? 'main')];
    if (groupDiff !== 0) return groupDiff;

    // Secondary sort: for checkboxes in the 'clauses' group, put opt-outs (default true) before opt-ins (default false)
    if (a[1].group === 'clauses' && b[1].group === 'clauses') {
      const aDefaultTrue =
        (a[1].default as unknown) === true || (a[1].default as unknown) === 'true';
      const bDefaultTrue =
        (b[1].default as unknown) === true || (b[1].default as unknown) === 'true';
      if (aDefaultTrue !== bDefaultTrue) {
        return aDefaultTrue ? -1 : 1; // true first, then false
      }
    }

    // Otherwise, keep original order
    return 0;
  });


  const rendered = new Set<string>();

  const renderField = (
    field: keyof StartupAdvisoryFormData,
    config: StartupAdvisoryFieldConfig,
    suppressLabel = false,
    options?: { suppressError?: boolean }
  ) => {
    const { suppressError = false } = options || {};
    const value = formData[field];
    if (config.type === 'checkbox') {
      return (
        <label className={styles.clauseToggle}>
          <input
            id={field}
            name={field}
            type="checkbox"
            checked={value === true || value === 'true'}
            onChange={handleChange(field)}
            onBlur={() => {
              onBlur(field, value as string);
              markTouched?.(field);
            }}
          />
          {config.label}
          {!suppressError &&
            (submitted || touched?.[field]) &&
            errors?.[field] && (
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
            name={field}
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
            name={field}
            type={config.type}
            value={value as string}
            onChange={handleChange(field)}
            onBlur={handleBlur(field)}
            placeholder={config.placeholder}
            className={styles.input}
          />
        )}

        {!suppressError &&
          (submitted || touched?.[field]) &&
          errors?.[field] && (
            <span className={styles.error}>{errors[field]}</span>
          )}
      </>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form
          id={formId}
          className={styles.formInner}
          onSubmit={handleFormSubmit}
        >
          {errors && Object.keys(errors).length > 0 && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}

          <h2 className={styles.formTitle}>
            🚀 {RetainerTypeLabel[FormType.StartupAdvisory]} Form
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
                      {renderField(
                        key as keyof StartupAdvisoryFormData,
                        config,
                        true,
                        { suppressError: true }
                      )}
                      {renderField(
                        partnerKey as keyof StartupAdvisoryFormData,
                        partnerCfg,
                        true,
                        { suppressError: true }
                      )}
                    </div>

                    {/* Show combined error if both halves missing */}
                    {combinedError &&
                      !(errors?.[key as keyof StartupAdvisoryFormData] ||
                        errors?.[partnerKey as keyof StartupAdvisoryFormData]) && (
                        <span className={styles.error}>{combinedError}</span>
                      )}

                    {/* Show per-field errors below the pair if only one half invalid */}
                    {!combinedError && errors?.[key as keyof StartupAdvisoryFormData] && (
                      <span className={styles.error}>
                        {errors[key as keyof StartupAdvisoryFormData]}
                      </span>
                    )}
                    {!combinedError && errors?.[partnerKey as keyof StartupAdvisoryFormData] && (
                      <span className={styles.error}>
                        {errors[partnerKey as keyof StartupAdvisoryFormData]}
                      </span>
                    )}
                  </div>
                );
              }
            }

            // Normal single field
            rendered.add(key);
            return (
              <div key={key} className={styles.formRow}>
                {renderField(key as keyof StartupAdvisoryFormData, config)}
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
