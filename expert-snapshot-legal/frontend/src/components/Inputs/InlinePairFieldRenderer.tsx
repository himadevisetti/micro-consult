// src/components/Inputs/InlinePairFieldRenderer.tsx

import styles from '../../styles/StandardRetainerForm.module.css';
import { InlinePairField } from '../../types/FamilyLawAgreementFieldConfig';

interface InlinePairFieldRendererProps<TFormData> {
  field: keyof TFormData;
  value: any[];
  config: { pair?: InlinePairField[];[key: string]: any };
  errors?: Record<string, string | undefined>;
  handleChange: (field: keyof TFormData) => (e: any) => void;
}

export default function InlinePairFieldRenderer<TFormData>({
  field,
  value,
  config,
  errors,
  handleChange,
}: InlinePairFieldRendererProps<TFormData>) {
  const getError = (key: string) => errors?.[key];

  const pair: InlinePairField[] = Array.isArray(config.pair) ? config.pair : [];
  const daysField = pair.find((sf: InlinePairField) => sf.type === 'multiselect');
  const timeRangeField = pair.find((sf: InlinePairField) => sf.type === 'time-range');

  const defaultRow: Record<string, any> = {
    [daysField?.key || 'days']: [],
    [timeRangeField?.key || 'hours']: { start: '', end: '' },
  };

  return (
    <div className={styles.workScheduleBlock}>
      {(Array.isArray(value) && value.length > 0 ? value : [{}]).map((entryRaw, idx) => {
        const entry = entryRaw as Record<string, any>;

        return (
          <div key={idx} className={styles.workScheduleEntry}>
            {/* Row 1: Days */}
            <div className={styles.daysFieldWrapper}>
              {daysField && daysField.options && (
                <>
                  <select
                    name={`${String(field)}_row_${idx}_days`}
                    className={styles.select}
                    multiple
                    value={entry[daysField.key] || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                      const updated = [...(Array.isArray(value) ? value : [])] as Record<string, any>[];
                      updated[idx] = { ...defaultRow, ...updated[idx], [daysField.key]: selected };
                      handleChange(field)({ target: { value: updated } } as any);
                    }}
                  >
                    {daysField.options.map((opt: { value: string; label: string }) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {getError(`${String(field)}_row_${idx}_days`) && (
                    <span className={styles.error}>{getError(`${String(field)}_row_${idx}_days`)}</span>
                  )}
                </>
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

            {/* Row 2: Time Range */}
            {timeRangeField && (
              <>
                <div className={styles.timeRange}>
                  {/* Start select */}
                  <select
                    name={`${String(field)}_row_${idx}_start`}
                    className={styles.select}
                    value={entry[timeRangeField.key]?.start || ''}
                    onChange={(e) => {
                      const updated = [...(Array.isArray(value) ? value : [])] as Record<string, any>[];
                      updated[idx] = {
                        ...defaultRow,
                        ...updated[idx],
                        [timeRangeField.key]: {
                          ...defaultRow[timeRangeField.key],
                          ...(updated[idx]?.[timeRangeField.key] || {}),
                          start: e.target.value,
                        },
                      };
                      handleChange(field)({ target: { value: updated } } as any);
                    }}
                  >
                    <option value="">Start</option>
                    {Array.from({ length: (60 / (timeRangeField.step || 30)) * 24 }, (_, i) => {
                      const h = Math.floor((i * (timeRangeField.step || 30)) / 60);
                      const m = (i * (timeRangeField.step || 30)) % 60;
                      const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                      return (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      );
                    })}
                  </select>

                  {/* End select */}
                  <select
                    name={`${String(field)}_row_${idx}_end`}
                    className={styles.select}
                    value={entry[timeRangeField.key]?.end || ''}
                    onChange={(e) => {
                      const updated = [...(Array.isArray(value) ? value : [])] as Record<string, any>[];
                      updated[idx] = {
                        ...defaultRow,
                        ...updated[idx],
                        [timeRangeField.key]: {
                          ...defaultRow[timeRangeField.key],
                          ...(updated[idx]?.[timeRangeField.key] || {}),
                          end: e.target.value,
                        },
                      };
                      handleChange(field)({ target: { value: updated } } as any);
                    }}
                  >
                    <option value="">End</option>
                    {(() => {
                      const start = entry[timeRangeField.key]?.start || '';
                      const step = timeRangeField.step || 30;
                      const times = Array.from({ length: (60 / step) * 24 }, (_, i) => {
                        const h = Math.floor((i * step) / 60);
                        const m = (i * step) % 60;
                        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                      });
                      return start
                        ? times.filter((t) => {
                          const [sh, sm] = start.split(':').map(Number);
                          const [eh, em] = t.split(':').map(Number);
                          return eh * 60 + em > sh * 60 + sm;
                        })
                        : times;
                    })().map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error below the pair */}
                {(getError(`${String(field)}_row_${idx}_start`) || getError(`${String(field)}_row_${idx}_end`)) && (
                  <span className={styles.error}>
                    {getError(`${String(field)}_row_${idx}_start`) || getError(`${String(field)}_row_${idx}_end`)}
                  </span>
                )}
              </>
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
          const updated =
            current.length === 0 ? [defaultEntry, defaultEntry] : [...current, defaultEntry];
          handleChange(field)({ target: { value: updated } } as any);
        }}
      >
        + Add Row
      </button>
    </div>
  );
}
