import React, { useState } from 'react';
import { TemplateVariable } from '../types/templates';
import { NormalizedMapping } from '../types/confirmMapping';
import { FIELD_LABELS } from '../constants/contractKeywords';
import { logDebug, logWarn } from "../utils/logger.js";
import styles from '../styles/StandardRetainerForm.module.css';

interface MappingRow extends TemplateVariable {
  touched?: boolean;
  confirmed?: boolean;
}

interface Props {
  templateName: string | null;
  candidates: TemplateVariable[];
  onConfirm: (finalMapping: NormalizedMapping[]) => void;
}

export default function FieldMappingReview({ templateName, candidates, onConfirm }: Props) {
  const initial: MappingRow[] = candidates
    .filter(c => c.schemaField !== "title")
    .map(c => ({
      ...c,
      schemaField: c.schemaField ?? (c.candidates?.length === 1 ? c.candidates[0] : null),
      touched: false,
      confirmed: false,
    }));

  const [mapping, setMapping] = useState<MappingRow[]>(initial);

  // Initial snapshot
  logDebug("fieldMapping.init", {
    templateName,
    rows: initial.map((m, i) => ({
      index: i,
      schemaField: m.schemaField,
      hasRawValue: !!m.rawValue && m.rawValue.trim().length > 0,
      placeholder: m.placeholder,
      confirmed: m.confirmed,
    })),
  });

  const handleChange = (index: number, field: string | null) => {
    const prev = mapping[index];
    const computedPlaceholder = field ? `{{${field}}}` : prev.placeholder;

    logDebug("fieldMapping.userSelection", {
      index,
      prevSchemaField: prev.schemaField,
      chosenSchemaField: field,
      computedPlaceholder,
    });

    const updated = [...mapping];
    updated[index] = {
      ...updated[index],
      schemaField: field,
      touched: true,
      confirmed: !!field,
      placeholder: computedPlaceholder,
    };
    setMapping(updated);
  };

  const handleDelete = (index: number) => {
    const updated = mapping.filter((_, i) => i !== index);
    setMapping(updated);
  };

  const handleCheckbox = (index: number) => {
    const updated = [...mapping];
    updated[index] = { ...updated[index], confirmed: !updated[index].confirmed };
    setMapping(updated);
  };

  const handleRawTextChange = (index: number, value: string) => {
    const updated = [...mapping];
    updated[index] = { ...updated[index], rawValue: value, touched: true };
    setMapping(updated);
  };

  const getStatus = (m: MappingRow): string => {
    if (!m.schemaField) return "Unmapped";
    if (m.candidates?.length === 1 && m.schemaField === m.candidates[0] && !m.touched) {
      return "Suggested";
    }
    if ((m.candidates?.length ?? 0) > 1 && !m.touched) {
      return "Suggested";
    }
    return "Mapped";
  };

  const handleConfirm = () => {
    // Snapshot before payload build
    logDebug("confirmMapping.buildStart", {
      rows: mapping.map((m, i) => ({
        index: i,
        schemaField: m.schemaField,
        status: getStatus(m),
        confirmed: m.confirmed,
        hasRawValue: !!m.rawValue && m.rawValue.trim().length > 0,
        placeholder: m.placeholder,
      })),
    });

    const normalized: NormalizedMapping[] = mapping.map((m, i) => {
      const status = getStatus(m);
      if (status === "Unmapped" || !m.schemaField) {
        logWarn("confirmMapping.unmappedRow", { index: i, schemaField: m.schemaField, status });
        throw new Error("Cannot confirm unmapped field");
      }
      if (!m.rawValue || !m.rawValue.trim()) {
        logWarn("confirmMapping.missingRaw", { index: i, schemaField: m.schemaField });
      }
      return {
        raw: m.rawValue,
        normalized: m.normalized,
        schemaField: m.schemaField,
        placeholder: m.placeholder,
      };
    });

    // Final payload snapshot
    logDebug("confirmMapping.payloadBuilt", {
      count: normalized.length,
      fields: normalized.map(m => m.schemaField),
    });

    onConfirm(normalized);
  };

  const disableConfirm = mapping.some(m => getStatus(m) === 'Unmapped' || !m.confirmed);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.formTitle}>
        Review Variables {templateName ? `for ${templateName}` : ''}
      </h2>

      <table className={`${styles.mappingTable} ${styles.formattedTable}`}>
        <thead>
          <tr>
            <th className={styles.rawTextCol}>Extracted Text</th>
            <th className={styles.mappedFieldCol}>Mapped Field</th>
            <th className={styles.statusCol}>Reviewed</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mapping.map((m, idx) => (
            <tr key={idx}>
              <td className={styles.rawTextCol}>
                {!m.schemaField && (m.candidates?.length ?? 0) === 0 ? (
                  <input
                    type="text"
                    value={m.rawValue ?? ''}
                    onChange={(e) => handleRawTextChange(idx, e.target.value)}
                    placeholder="Enter raw text from document"
                    className={styles.textInput}
                  />
                ) : m.schemaField === 'partyA' || m.schemaField === 'partyB' ? (
                  <span className={styles.rawValue}>{m.rawValue}</span>
                ) : (
                  <>
                    <span>
                      {expandedIndex === idx
                        ? m.rawValue
                        : m.displayValue ?? m.normalized ?? m.rawValue}
                    </span>
                    {(() => {
                      const shouldShowToggle =
                        m.displayValue &&
                        m.rawValue &&
                        m.rawValue.trim() !== m.displayValue.trim() &&
                        m.rawValue.length > m.displayValue.length + 10;
                      return shouldShowToggle ? (
                        <button
                          type="button"
                          className={styles.viewFullButton}
                          onClick={() =>
                            setExpandedIndex(expandedIndex === idx ? null : idx)
                          }
                        >
                          {expandedIndex === idx ? 'Hide' : 'View full'}
                        </button>
                      ) : null;
                    })()}
                  </>
                )}
              </td>

              {/* ✅ Always show FIELD_LABELS in Mapped Field column */}
              <td className={styles.mappedFieldCol}>
                {m.candidates && m.candidates.length > 1 ? (
                  // Multiple candidates → dropdown with labels
                  <select
                    value={m.schemaField ?? ''}
                    onChange={(e) => handleChange(idx, e.target.value || null)}
                    className={`${styles.selectInput} ${!m.touched ? styles.suggestedSelect : ''}`}
                  >
                    <option value="">Select…</option>
                    {m.candidates.map((c, i) => (
                      <option key={i} value={c}>
                        {FIELD_LABELS[c] ?? c}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Single candidate OR zero candidates → editable input showing label if available
                  (() => {
                    const key = m.schemaField ?? m.candidates?.[0] ?? '';
                    const label = FIELD_LABELS[key] ?? key;

                    return (
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => handleChange(idx, e.target.value || null)}
                        className={m.candidates && m.candidates.length === 1 ? styles.suggestedText : styles.textInput}
                      />
                    );
                  })()
                )}
              </td>

              <td className={styles.statusCol}>
                <input
                  type="checkbox"
                  checked={m.confirmed}
                  onChange={() => handleCheckbox(idx)}
                  disabled={getStatus(m) === 'Unmapped'}
                  title={getStatus(m)}
                />
                <span
                  className={styles[`status${getStatus(m)}`]}
                  style={{ marginLeft: '0.5rem' }}
                >
                  {getStatus(m)}
                </span>
              </td>
              <td className={styles.actionsCol}>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className={styles.deleteButton}
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.submitRow}>
        <button
          onClick={() => {
            const newVar: MappingRow = {
              rawValue: '',
              schemaField: null,
              candidates: [],
              touched: false,
              confirmed: false,
              placeholder: `{{customVar${mapping.length + 1}}}`
            };
            setMapping([...mapping, newVar]);
          }}
          className={styles.secondaryButton}
        >
          + Add Variable
        </button>
        <button
          onClick={handleConfirm}
          className={styles.submitButton}
          disabled={disableConfirm}
        >
          Confirm Mapping
        </button>
      </div>
    </div>
  );
}
