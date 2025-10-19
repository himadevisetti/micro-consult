// src/components/FormFlows/GenerateDocumentForm.tsx
import styles from '../../styles/StandardRetainerForm.module.css';
import type { ManifestVariable } from '@/types/manifest';
import CustomDatePicker from '../Inputs/CustomDatePicker';

interface GenerateDocumentFormProps {
  variables: ManifestVariable[];
  formData: Record<string, string>;
  rawFormData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onRawChange: (field: string, value: string) => void;
  onBlur: (field: string, value: string) => void;
  markTouched?: (field: string) => void;
  onSubmit: (values: Record<string, string>) => void;
}

const GenerateDocumentForm = ({
  variables,
  formData,
  rawFormData,
  setFormData,
  onRawChange,
  onBlur,
  markTouched,
  onSubmit,
}: GenerateDocumentFormProps) => {
  const handleChange =
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (v: ManifestVariable) => {
    const value = formData[v.schemaField] ?? '';

    const normalizedCurrencyValue =
      v.inputType === 'currency' && typeof value === 'string'
        ? value.replace(/[^0-9.-]/g, '')
        : value;

    return (
      <div key={v.schemaField} className={styles.formRow}>
        <label htmlFor={v.schemaField} className={styles.label}>
          {v.label}
        </label>

        {v.inputType === 'textarea' ? (
          <textarea
            id={v.schemaField}
            name={v.schemaField}
            value={value}
            onChange={handleChange(v.schemaField)}
            placeholder={v.placeholder}
            className={`${styles.input} ${styles.textarea}`}
          />
        ) : v.inputType === 'select' && v.options ? (
          <select
            id={v.schemaField}
            name={v.schemaField}
            value={value}
            onChange={handleChange(v.schemaField)}
            className={styles.select}
          >
            <option value="">-- Select --</option>
            {v.options.map((opt) => (
              <option key={opt} value={opt.trim()}>
                {opt}
              </option>
            ))}
          </select>
        ) : v.inputType === 'date' ? (
          (() => {
            const rawValue = rawFormData[v.schemaField];
            return (
              <CustomDatePicker
                id={v.schemaField}
                name={v.schemaField}
                value={typeof rawValue === 'string' ? rawValue : ''}
                onChange={(newIso: string) => {
                  onRawChange(v.schemaField, newIso);
                  setFormData((prev) => ({ ...prev, [v.schemaField]: newIso }));
                  markTouched?.(v.schemaField);
                }}
                onBlur={() => {
                  const safeValue = typeof rawValue === 'string' ? rawValue : '';
                  onBlur(v.schemaField, safeValue);
                  markTouched?.(v.schemaField);
                }}
                placeholder={v.placeholder}
                className={styles.input}
                style={{ flex: 1 }}
              />
            );
          })()
        ) : v.inputType === 'currency' ? (
          <div className={styles.currencyInputWrapper}>
            <span className={styles.dollarPrefix}>$</span>
            <input
              id={v.schemaField}
              name={v.schemaField}
              type="number"
              step="0.01"
              value={normalizedCurrencyValue}
              onChange={handleChange(v.schemaField)}
              placeholder={v.placeholder}
              className={`${styles.input} ${styles.inputWithPrefix}`}
            />
          </div>
        ) : (
          <input
            id={v.schemaField}
            name={v.schemaField}
            type="text"
            value={value}
            onChange={handleChange(v.schemaField)}
            placeholder={v.placeholder}
            className={styles.input}
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form className={styles.formInner} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>📄 Generate Document</h2>

          {variables.map((v) => renderField(v))}

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateDocumentForm;
