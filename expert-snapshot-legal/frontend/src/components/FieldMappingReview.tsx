// src/components/FieldMappingReview.tsx
import React, { useState } from 'react';
import { TemplateVariable } from '../types/templates';
import styles from '../styles/StandardRetainerForm.module.css';

interface MappingRow extends TemplateVariable {
  touched?: boolean;
}

interface Props {
  templateName: string | null;
  candidates: TemplateVariable[];
  onConfirm: (finalMapping: TemplateVariable[]) => void;
}

export default function FieldMappingReview({ templateName, candidates, onConfirm }: Props) {
  // filter out Title upfront and initialize touched=false
  const initial: MappingRow[] = candidates
    .filter(c => c.schemaField !== 'title')
    .map(c => ({ ...c, touched: false }));

  const [mapping, setMapping] = useState<MappingRow[]>(initial);

  const handleChange = (index: number, field: string | null) => {
    const updated = [...mapping];
    updated[index] = { ...updated[index], schemaField: field, touched: true };
    setMapping(updated);
  };

  const handleDelete = (index: number) => {
    const updated = mapping.filter((_, i) => i !== index);
    setMapping(updated);
  };

  const handleConfirm = () => {
    onConfirm(mapping);
  };

  const addVariable = () => {
    setMapping([
      ...mapping,
      { rawValue: '', schemaField: null, candidates: [], confidence: undefined, touched: false },
    ]);
  };

  const showConfidence = process.env.NODE_ENV === 'development';

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
            <th className={styles.statusCol}>Status</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mapping.map((m, idx) => (
            <tr key={idx}>
              <td className={styles.rawTextCol}>
                {/* Render enriched values */}
                {m.schemaField === 'partyA' || m.schemaField === 'partyB'
                  ? `${m.schemaField === 'partyA' ? 'Party A' : 'Party B'} (${m.roleHint ?? ''}): ${m.rawValue}`
                  : m.displayValue ?? m.normalized ?? m.rawValue}
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
                {(() => {
                  const status = getStatus(m);
                  if (status === 'Mapped') {
                    return <span className={styles.statusMapped}>Mapped</span>;
                  }
                  if (status === 'Suggested') {
                    return <span className={styles.statusSuggested}>Suggested</span>;
                  }
                  return <span className={styles.statusUnmapped}>Unmapped</span>;
                })()}
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
        <button onClick={addVariable} className={styles.secondaryButton}>
          + Add Variable
        </button>
        <button
          onClick={handleConfirm}
          className={styles.submitButton}
          disabled={mapping.some(m => !m.schemaField)}
        >
          Confirm Mapping
        </button>
      </div>
    </div>
  );
}
