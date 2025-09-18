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
    if (!errors || Object.keys(errors).length === 0) return;

    const formEl = document.getElementById('employment-agreement-form');
    if (!formEl) return;

    /**
     * Expand combined keys like "baseSalary__payFrequency" into individual keys
     * purely for DOM matching.
     *
     * ⚠️ This does NOT change validation behaviour:
     * - Validation still produces a single combined key for inline pairs.
     * - UI still shows one combined error message under the pair.
     * - This split is ONLY so we can match either member of the pair in the DOM
     *   and decide which actual input to focus (usually the first in the pair).
     */
    const errorFieldNames = new Set<string>();
    for (const key of Object.keys(errors)) {
      if (key.includes('__')) {
        const [a, b] = key.split('__');
        errorFieldNames.add(a);
        errorFieldNames.add(b);
      } else {
        errorFieldNames.add(key);
      }
    }

    // Get all focusable fields in DOM order
    const focusables = Array.from(
      formEl.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
      )
    );

    // Find the first focusable whose name matches an error field
    const target = focusables.find(el =>
      errorFieldNames.has(el.getAttribute('name') || '')
    );

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus();
      });
    }
  }, [errors]);

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

    // Early return for checkboxes – matches EmploymentAgreementForm
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
          Array.isArray(config.suggestions) && config.suggestions.length > 0 ? (
            // Branch 1: textarea WITH suggestions (e.g., Benefits)
            <div className={styles.textareaWrapper}>
              <div className={styles.suggestions}>
                {config.suggestions.map(s => (
                  <button
                    type="button"
                    key={s}
                    className={styles.suggestionButton}
                    onClick={() => {
                      // Ensure we have an array in state
                      const lines = Array.isArray(value)
                        ? value.map(l => String(l).trim())
                        : String(value || '').split('\n').map(l => l.trim()).filter(Boolean);

                      if (!lines.includes(s)) {
                        const updatedLines = [...lines, s];
                        // Pass updated array back to form state
                        handleChange(field)({
                          target: { value: updatedLines }
                        } as unknown as React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                        >);
                      }
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <textarea
                id={field}
                name={field}
                value={Array.isArray(value) ? value.join('\n') : String(value || '')}
                onChange={e => {
                  const lines = e.target.value
                    .split('\n')
                    .map(l => l.trim())
                    .filter(Boolean);
                  // Store as array in state
                  handleChange(field)({
                    target: { value: lines }
                  } as unknown as React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                  >);
                }}
                onBlur={handleBlur(field)}
                placeholder={config.placeholder}
                className={`${styles.input} ${styles.textarea}`}
              />
            </div>
          ) : (
            // Branch 2: DEFAULT textarea (unchanged)
            <textarea
              id={field}
              name={field}
              value={value as string}
              onChange={handleChange(field)}
              onBlur={handleBlur(field)}
              placeholder={config.placeholder}
              className={`${styles.input} ${styles.textarea}`}
            />
          )
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
        ) : (config.type === 'inline-pair') ? (
          <div className={styles.workScheduleBlock}>
            {(Array.isArray(value) && value.length > 0 ? value : [{}]).map((entryRaw, idx) => {

              const entry = entryRaw as Record<string, any>;

              const pair = Array.isArray(config.pair) ? config.pair : [];
              const daysField = pair.find(sf => sf.type === 'multiselect');
              const timeRangeField = pair.find(sf => sf.type === 'time-range');

              return (
                <div key={idx} className={styles.workScheduleEntry}>
                  {/* Row 1: Days (full width) with minus at top-right corner */}
                  <div className={styles.daysFieldWrapper}>
                    {daysField && daysField.options && (
                      <select
                        className={styles.select}
                        multiple
                        value={entry[daysField.key] || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, o => o.value);
                          // IMPORTANT: coalesce to [] so we don't inject {} into state
                          const updated = [...(Array.isArray(value) ? value : [])] as Record<string, any>[];
                          updated[idx] = { ...updated[idx], [daysField.key]: selected };
                          handleChange(field)({ target: { value: updated } } as any);
                        }}
                      >
                        {daysField.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}

                    {(Array.isArray(value) && value.length > 1) && (
                      <button
                        type="button"
                        className={styles.removeRowButton}
                        onClick={() => {
                          const current = Array.isArray(value) ? value : [];
                          const updated = current.filter((_, i) => i !== idx);
                          handleChange(field)({ target: { value: updated } } as any);
                        }}
                        aria-label={`Remove row ${idx + 1}`}
                      >
                        &minus;
                      </button>
                    )}
                  </div>

                  {/* Row 2: Time Range (Start | End inline-pair) */}
                  {timeRangeField && (
                    <div className={styles.timeRange}>
                      {(() => {
                        const subValue = entry[timeRangeField.key] || {};
                        const start = subValue.start || '';
                        const end = subValue.end || '';
                        const step = timeRangeField.step || 30;
                        const times = Array.from({ length: (60 / step) * 24 }, (_, i) => {
                          const h = Math.floor((i * step) / 60);
                          const m = (i * step) % 60;
                          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                        });

                        return (
                          <>
                            <select
                              className={styles.select}
                              value={start}
                              onChange={(e) => {
                                const updated = [...(Array.isArray(value) ? value : [])] as Record<string, any>[];
                                updated[idx] = {
                                  ...updated[idx],
                                  [timeRangeField.key]: {
                                    ...((updated[idx][timeRangeField.key] as Record<string, any>) || {}),
                                    start: e.target.value
                                  }
                                };
                                handleChange(field)({ target: { value: updated } } as any);
                              }}
                            >
                              <option value="">Start</option>
                              {times.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                              className={styles.select}
                              value={end}
                              onChange={(e) => {
                                const updated = [...(Array.isArray(value) ? value : [])] as Record<string, any>[];
                                updated[idx] = {
                                  ...updated[idx],
                                  [timeRangeField.key]: {
                                    ...((updated[idx][timeRangeField.key] as Record<string, any>) || {}),
                                    end: e.target.value
                                  }
                                };
                                handleChange(field)({ target: { value: updated } } as any);
                              }}
                            >
                              <option value="">End</option>
                              {times.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Row 3: Add Row button */}
            <button
              type="button"
              onClick={() => {
                const defaultEntry = { days: [], hours: { start: '', end: '' } };
                const current = Array.isArray(value) ? value : [];
                // If value is empty/undefined, first click produces TWO rows to overcome the render fallback [{}]
                const updated = current.length === 0
                  ? [defaultEntry, defaultEntry]
                  : [...current, defaultEntry];
                handleChange(field)({ target: { value: updated } } as any);
              }}
            >
              + Add Row
            </button>
          </div>
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
