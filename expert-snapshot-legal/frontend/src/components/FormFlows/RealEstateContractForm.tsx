// src/components/FormFlows/RealEstateContractForm.tsx

import React, { useRef, useState, useEffect } from 'react';
import {
  RealEstateContractFormData,
  defaultRealEstateContractFormData
} from '../../types/RealEstateContractFormData';
import { FormType, RetainerTypeLabel, getFormDomId } from '@/types/FormType';
import { RealEstateContractFieldConfig } from '@/types/RealEstateContractFieldConfig';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
import { FormBlurHandler } from '@/types/FormUtils';
import { focusFirstError } from '@/utils/focusFirstError';
import SubmitButton from '../../utils/SubmitButton';

export interface RealEstateContractFormProps {
  schema: Record<string, RealEstateContractFieldConfig>;
  formData: RealEstateContractFormData;
  rawFormData: RealEstateContractFormData;
  errors?: Partial<Record<keyof RealEstateContractFormData, string>>;
  touched?: Partial<Record<keyof RealEstateContractFormData, boolean>>;
  onChange: (field: keyof RealEstateContractFormData, value: string | number | boolean | Date) => void;
  onRawChange: (field: keyof RealEstateContractFormData, value: string) => void;
  onBlur: FormBlurHandler<RealEstateContractFormData>;
  onSubmit?: (rawFormData: RealEstateContractFormData) => Promise<void>;
  markTouched?: (field: keyof RealEstateContractFormData) => void;
}

export default function RealEstateContractForm({
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
}: RealEstateContractFormProps) {
  const formId = getFormDomId(FormType.RealEstateContract);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof RealEstateContractFormData) => (
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

  const handleBlur = (field: keyof RealEstateContractFormData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onBlur(field, e.target.value);
    markTouched?.(field);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSubmitting(true);

    Object.keys(schema).forEach((k) => {
      const key = k as keyof RealEstateContractFormData;
      markTouched?.(key);
    });

    try {
      await onSubmit?.(rawFormData);
    } catch (err) {
      console.error('[RealEstateContractForm] Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const formEl = document.getElementById(formId);
    if (!formEl) return;

    if (errors && Object.keys(errors).length > 0) {
      focusFirstError(formId, errors);
    } else {
      const editable = formEl.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])'
      );
      editable?.focus();
    }
  }, [errors]);

  function getDefault<K extends keyof RealEstateContractFormData>(
    key: K,
    schema: Record<string, any>
  ): RealEstateContractFormData[K] {
    const fromSchema = schema[key]?.default as RealEstateContractFormData[K] | undefined;
    return fromSchema !== undefined ? fromSchema : defaultRealEstateContractFormData[key];
  }

  function toBool(val: unknown): boolean {
    return val === true || val === 'true' || val === 1 || val === '1';
  }

  const prevVisibilityRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const normalise = (v: unknown) =>
      v === undefined || v === null ? '' : String(v).trim().toLowerCase();

    Object.entries(schema).forEach(([key, config]) => {
      const field = key as keyof RealEstateContractFormData;
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
    field: keyof RealEstateContractFormData,
    config: RealEstateContractFieldConfig,
    suppressLabel = false,
    options?: { suppressError?: boolean }
  ) => {
    const { suppressError = false } = options || {};
    const value = formData[field];

    // Early return for checkboxes
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

    const isDependent = typeof config.showIf === 'function';
    const isRequired =
      config.required === true ||
      (typeof config.requiredIf === 'function' && config.requiredIf(formData));

    return (
      <>
        {!suppressLabel && config.label && (
          <label htmlFor={field} className={styles.label}>
            {!isRequired ? (
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
            value={String(value ?? '')}
            onChange={handleChange(field)}
            onBlur={handleBlur(field)}
            placeholder={config.placeholder}
            className={`${styles.input} ${styles.textarea}`}
          />
        ) : config.type === 'dropdown' && config.options ? (
          <select
            id={field}
            name={field}
            value={String(value ?? '')}
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
            value={String(value ?? '')}
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
            🏠 {RetainerTypeLabel[FormType.RealEstateContract]} Form
          </h2>

          {sortedFields.map(([key, config]) => {
            if (rendered.has(key)) return null;

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
                        key as keyof RealEstateContractFormData,
                        config,
                        true,
                        { suppressError: true }
                      )}
                      {renderField(
                        partnerKey as keyof RealEstateContractFormData,
                        partnerCfg,
                        true,
                        { suppressError: true }
                      )}
                    </div>

                    {combinedError &&
                      !(errors?.[key as keyof RealEstateContractFormData] ||
                        errors?.[partnerKey as keyof RealEstateContractFormData]) && (
                        <span className={styles.error}>{combinedError}</span>
                      )}

                    {!combinedError &&
                      errors?.[key as keyof RealEstateContractFormData] && (
                        <span className={styles.error}>
                          {errors[key as keyof RealEstateContractFormData]}
                        </span>
                      )}
                    {!combinedError &&
                      errors?.[partnerKey as keyof RealEstateContractFormData] && (
                        <span className={styles.error}>
                          {errors[partnerKey as keyof RealEstateContractFormData]}
                        </span>
                      )}
                  </div>
                );
              }
            }

            rendered.add(key);
            return (
              <div key={key} className={styles.formRow}>
                {renderField(key as keyof RealEstateContractFormData, config)}
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
