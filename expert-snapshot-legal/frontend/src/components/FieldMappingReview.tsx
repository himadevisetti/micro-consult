import React, { useState } from 'react';
import { TemplateVariable } from '../types/templates';
import { NormalizedMapping } from '../types/confirmMapping';
import { formatFieldLabel, toPlaceholder } from '../utils/formatters';
import { logDebug, logWarn } from "../utils/logger.js";
import styles from '../styles/StandardRetainerForm.module.css';

interface MappingRow extends TemplateVariable {
  touched?: boolean;
  confirmed?: boolean;
  deleted?: boolean;
}

interface Props {
  templateName: string | null;
  candidates: TemplateVariable[];
  // onConfirm returns a result so we can handle errors
  onConfirm: (finalMapping: NormalizedMapping[]) => Promise<{ ok: boolean; error?: string }>;
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // New state for UX
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial snapshot
  logDebug("fieldMapping.init", {
    templateName,
    rows: initial.map((m, i) => ({
      index: i,
      schemaField: m.schemaField,
      candidates: m.candidates?.join(", ") ?? "[]",
      hasRawValue: !!m.rawValue && m.rawValue.trim().length > 0,
      placeholder: m.placeholder,
      confirmed: m.confirmed,
    })),
  });

  const handleChange = (index: number, field: string | null) => {
    const prev = mapping[index];
    const computedPlaceholder = field ? toPlaceholder(field) ?? prev.placeholder : prev.placeholder;

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
    const updated = mapping.map((m, i) =>
      i === index ? { ...m, deleted: true } : m
    );
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
    if (m.deleted) return "Deleted";
    if (!m.schemaField) return "Unmapped";
    if (m.candidates?.length === 1 && m.schemaField === m.candidates[0] && !m.touched) {
      return "Suggested";
    }
    if ((m.candidates?.length ?? 0) > 1 && !m.touched) {
      return "Suggested";
    }
    return "Mapped";
  };

  // 🔹 Updated handleConfirm with async + error handling
  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

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
          placeholder: m.placeholder ? m.placeholder : toPlaceholder(m.schemaField),
          deleted: (m as any).deleted ?? false,
        };
      });

      logDebug("confirmMapping.payloadBuilt", {
        count: normalized.length,
        fields: normalized.map(m => m.schemaField),
        placeholders: normalized.map(m => m.placeholder),
        deleted: normalized.filter(m => (m as any).deleted).map(m => m.schemaField),
      });

      const result = await onConfirm(normalized);
      if (!result.ok) {
        setError(result.error ?? "Failed to confirm mapping");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const disableConfirm = mapping
    .filter(m => !m.deleted)
    .some(m => getStatus(m) === "Unmapped" || !m.confirmed);

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.formTitle}>
        Review Variables {templateName ? `for ${templateName}` : ''}
      </h2>

      {error && <div className={styles.errorBanner}>{error}</div>}

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
          {mapping
            .filter(m => !m.deleted)
            .map((m, idx) => (
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
                          ? (m.isExpandable ? (m.sourceText ?? m.rawValue) : m.rawValue)
                          : m.displayValue ?? m.normalized ?? m.rawValue}
                      </span>
                      {(() => {
                        const fullText = m.sourceText ?? m.rawValue;
                        const shouldShowToggle =
                          m.isExpandable &&                // only for expandable fields
                          m.displayValue &&
                          fullText &&
                          fullText.trim() !== m.displayValue.trim() &&
                          fullText.length > m.displayValue.length + 10;

                        return shouldShowToggle ? (
                          <button
                            type="button"
                            className={styles.viewFullButton}
                            onClick={() =>
                              setExpandedIndex(expandedIndex === idx ? null : idx)
                            }
                          >
                            {expandedIndex === idx ? "Hide" : "View full"}
                          </button>
                        ) : null;
                      })()}
                    </>
                  )}
                </td>

                {/* ✅ Always show FIELD_LABELS in Mapped Field column */}
                <td className={styles.mappedFieldCol}>
                  {m.candidates && m.candidates.length > 1 ? (
                    <select
                      value={m.schemaField ?? ''}
                      onChange={(e) => handleChange(idx, e.target.value || null)}
                      className={`${styles.selectInput} ${!m.touched ? styles.suggestedSelect : ''}`}
                    >
                      <option value="">Select…</option>
                      {m.candidates.map((c, i) => (
                        <option key={i} value={c}>
                          {formatFieldLabel(c)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (() => {
                      const key = m.schemaField ?? m.candidates?.[0] ?? '';
                      const label = formatFieldLabel(key);

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
          disabled={disableConfirm || loading}
        >
          {loading ? "Confirming…" : "Confirm Mapping"}
        </button>
      </div>
    </div>
  );
}
