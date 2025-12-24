// src/components/FormFlows/FamilyLawAgreementForm.tsx

import React, { useRef, useState, useEffect } from 'react';
import {
  FamilyLawAgreementFormData,
  defaultFamilyLawAgreementFormData
} from '../../types/FamilyLawAgreementFormData';
import { FormType, RetainerTypeLabel, getFormDomId } from '@/types/FormType';
import { FamilyLawAgreementFieldConfig } from '@/types/FamilyLawAgreementFieldConfig';
import CustomDatePicker from '../Inputs/CustomDatePicker';
import styles from '../../styles/StandardRetainerForm.module.css';
import { FormBlurHandler } from '@/types/FormUtils';
import { focusFirstError } from '@/utils/focusFirstError';
import InlinePairFieldRenderer from '../Inputs/InlinePairFieldRenderer';

export interface FamilyLawAgreementFormProps {
  schema: Record<string, FamilyLawAgreementFieldConfig>;
  formData: FamilyLawAgreementFormData;
  rawFormData: FamilyLawAgreementFormData;
  errors?: Partial<Record<keyof FamilyLawAgreementFormData, string>>;
  touched?: Partial<Record<keyof FamilyLawAgreementFormData, boolean>>;
  onChange: (field: keyof FamilyLawAgreementFormData, value: string | number | boolean | Date) => void;
  onRawChange: (field: keyof FamilyLawAgreementFormData, value: string) => void;
  onBlur: FormBlurHandler<FamilyLawAgreementFormData>;
  onSubmit?: (rawFormData: FamilyLawAgreementFormData) => Promise<void>;
  markTouched?: (field: keyof FamilyLawAgreementFormData) => void;
}

export default function FamilyLawAgreementForm({
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
}: FamilyLawAgreementFormProps) {
  const formId = getFormDomId(FormType.FamilyLawAgreement);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof FamilyLawAgreementFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const raw = e.target.value;
    const config = schema[field];

    let parsed: string | number | boolean = raw;

    if (config.type === 'number') {
      parsed = raw === '' ? 0 : parseFloat(raw);
    }

    onRawChange(field, raw);
    onChange(field, parsed);
    markTouched?.(field);
  };

  const handleBlur = (field: keyof FamilyLawAgreementFormData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onBlur(field, e.target.value);
    markTouched?.(field);
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

  function getDefault<K extends keyof FamilyLawAgreementFormData>(
    key: K,
    schema: Record<string, any>
  ): FamilyLawAgreementFormData[K] {
    const fromSchema = schema[key]?.default as FamilyLawAgreementFormData[K] | undefined;
    return fromSchema !== undefined ? fromSchema : defaultFamilyLawAgreementFormData[key];
  }

  const prevVisibilityRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const normalise = (v: unknown) =>
      v === undefined || v === null ? '' : String(v).trim().toLowerCase();

    Object.entries(schema).forEach(([key, config]) => {
      const field = key as keyof FamilyLawAgreementFormData;
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

      prevVisibilityRef.current[field] = visible;
    });
  }, [formData, schema, onChange, onRawChange]);

  const visibleFields = Object.entries(schema).filter(
    ([, cfg]) => !cfg.showIf || cfg.showIf(formData)
  );

  const sortedFields = [...visibleFields]; // no clause group needed

  const rendered = new Set<string>();

  const renderField = (
    field: keyof FamilyLawAgreementFormData,
    config: FamilyLawAgreementFieldConfig,
    suppressLabel = false,
    options?: { suppressError?: boolean }
  ) => {
    const { suppressError = false } = options || {};
    const value = formData[field];

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

        {config.type === "number" ? (
          <input
            id={field}
            name={field}
            type="number"
            step="0.01"
            value={typeof value === "number" ? value : ""}
            onChange={handleChange(field)}
            onBlur={handleBlur(field)}
            placeholder={config.placeholder}
            className={styles.input}
          />
        ) : config.type === "date" ? (
          (() => {
            const rawValue = rawFormData[field];
            return (
              <CustomDatePicker
                id={field}
                name={field}
                value={typeof rawValue === "string" ? rawValue : ""}
                onChange={(newIso: string) => {
                  onRawChange(field, newIso);
                  onChange(field, newIso);
                  markTouched?.(field);
                }}
                onBlur={() => {
                  const safeValue =
                    typeof rawValue === "string" ? rawValue : "";
                  onBlur(field, safeValue);
                  markTouched?.(field);
                }}
                placeholder={config.placeholder}
                className={styles.input}
                style={{ flex: 1 }}
              />
            );
          })()
        ) : config.type === "textarea" ? (
          <textarea
            id={field}
            name={field}
            value={typeof value === "string" ? value : ""}
            onChange={handleChange(field)}
            onBlur={handleBlur(field)}
            placeholder={config.placeholder}
            className={`${styles.input} ${styles.textarea}`}
          />
        ) : config.type === "dropdown" && config.options ? (
          <select
            id={field}
            name={field}
            value={typeof value === "string" ? value : ""}
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
        ) : config.type === "inline-pair" ? (
          <InlinePairFieldRenderer<FamilyLawAgreementFormData>
            field={field}
            value={Array.isArray(value) ? value : []}
            config={config}
            errors={errors as Record<string, string | undefined>}
            handleChange={handleChange}
          />
        ) : (
          <input
            id={field}
            name={field}
            type={config.type}
            value={typeof value === "string" ? value : ""}
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
        <div id={formId} className={styles.formInner}>
          {errors && Object.keys(errors).length > 0 && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}

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
                        key as keyof FamilyLawAgreementFormData,
                        config,
                        true,
                        { suppressError: true }
                      )}
                      {renderField(
                        partnerKey as keyof FamilyLawAgreementFormData,
                        partnerCfg,
                        true,
                        { suppressError: true }
                      )}
                    </div>

                    {combinedError &&
                      !(errors?.[key as keyof FamilyLawAgreementFormData] ||
                        errors?.[partnerKey as keyof FamilyLawAgreementFormData]) && (
                        <span className={styles.error}>{combinedError}</span>
                      )}

                    {!combinedError &&
                      errors?.[key as keyof FamilyLawAgreementFormData] && (
                        <span className={styles.error}>
                          {errors[key as keyof FamilyLawAgreementFormData]}
                        </span>
                      )}
                    {!combinedError &&
                      errors?.[partnerKey as keyof FamilyLawAgreementFormData] && (
                        <span className={styles.error}>
                          {errors[partnerKey as keyof FamilyLawAgreementFormData]}
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
                {renderField(key as keyof FamilyLawAgreementFormData, config)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
