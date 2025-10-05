import React, { useState } from 'react';
import { TemplateVariable } from '../types/templates';
import { NormalizedMapping } from '../types/confirmMapping';
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
    .filter(c => c.schemaField !== 'title')
    .map(c => ({ ...c, touched: false, confirmed: false }));

  const [mapping, setMapping] = useState<MappingRow[]>(initial);

  const handleChange = (index: number, field: string | null) => {
    const updated = [...mapping];
    updated[index] = {
      ...updated[index],
      schemaField: field,
      touched: true,
      confirmed: !!field
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
    if (!m.schemaField) return 'Unmapped';
    if (m.candidates?.length === 1 && m.schemaField === m.candidates[0] && !m.touched) {
      return 'Suggested';
    }
    if ((m.candidates?.length ?? 0) > 1 && !m.touched) {
      return 'Suggested';
    }
    return 'Mapped';
  };

  const handleConfirm = () => {
    const normalized: NormalizedMapping[] = mapping.map(m => {
      const status = getStatus(m);
      if (status === 'Unmapped' || !m.schemaField) {
        throw new Error("Cannot confirm unmapped field");
      }
      return {
        raw: m.rawValue,
        normalized: m.normalized,
        schemaField: m.schemaField
      };
    });

    onConfirm(normalized);
  };

  const showConfidence = process.env.NODE_ENV === 'development';
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
            <th className={styles.rawTextCol}>Raw Text</th>
            <th className={styles.mappedFieldCol}>Mapped Field</th>
            {showConfidence && <th>Confidence</th>}
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
                  `${m.schemaField === 'partyA' ? 'Party A' : 'Party B'} (${m.roleHint ?? ''}): ${m.rawValue}`
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
                        m.rawValue.length > m.displayValue.length + 10; // require meaningful gap
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
                        {c}
                      </option>
                    ))}
                  </select>
                ) : m.candidates && m.candidates.length === 1 ? (
                  <input
                    type="text"
                    value={m.schemaField ?? m.candidates[0]}
                    onChange={(e) => handleChange(idx, e.target.value || null)}
                    className={styles.suggestedText}
                  />
                ) : (
                  <input
                    type="text"
                    value={m.schemaField ?? ''}
                    onChange={(e) => handleChange(idx, e.target.value || null)}
                    placeholder="Assign schema field"
                    className={styles.textInput}
                  />
                )}
              </td>
              {showConfidence && (
                <td>{m.confidence != null ? `${(m.confidence * 100).toFixed(0)}%` : '—'}</td>
              )}
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
          onClick={() =>
            setMapping([
              ...mapping,
              {
                rawValue: '',
                schemaField: null,
                candidates: [],
                confidence: undefined,
                touched: false,
                confirmed: false
              }
            ])
          }
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
