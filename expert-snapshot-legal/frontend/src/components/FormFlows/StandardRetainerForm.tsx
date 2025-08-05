import React, { useState } from 'react';
import { standardRetainerSchema } from '../../schemas/standardRetainerSchema';
import StandardPreview from '../AgreementPreview/StandardPreview';
import DownloadToggle from '../Export/DownloadToggle';
import { exportRetainer } from '../../utils/export/exportHandler';
import { getSerializedClauses } from '../../utils/serializeClauses';

export default function StandardRetainerForm() {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [previewElement, setPreviewElement] = useState<HTMLElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    for (const [key, config] of Object.entries(standardRetainerSchema)) {
      const value = formData[key];
      if (config.required && !value) {
        newErrors[key] = `${config.label} is required.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    if (validateForm()) {
      console.log('Payload:', formData);
      setSubmitted(true);
    }
  };

  const renderField = (key: string, config: any) => {
    const error = errors[key];
    const commonProps = {
      name: key,
      value: formData[key] || '',
      onChange: handleChange,
      required: config.required,
    };

    return (
      <div key={key} className="form-field">
        <label htmlFor={key}>{config.label}</label>
        {config.type === 'select' ? (
          <select {...commonProps}>
            <option value="">Select {config.label}</option>
            {config.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={key}
            type={config.type || 'text'}
            placeholder={config.placeholder}
            {...commonProps}
          />
        )}
        {error && <p className="error">{error}</p>}
      </div>
    );
  };

  const handleDownload = async (type: 'pdf' | 'docx') => {
    const clauseHTML = getSerializedClauses(formData);

    const agreementData = {
      ...formData,
      legalGroup: 'Expert Snapshot Legal',
      executionDate: formData.startDate,
      ...clauseHTML,
    };

    exportRetainer(type, agreementData, previewElement || undefined);
  };

  return (
    <div>
      <form className="retainer-form" onSubmit={handleSubmit}>
        {Object.entries(standardRetainerSchema).map(([key, config]) => renderField(key, config))}
        <button type="submit">Submit</button>
        {submitted && <p className="success">Form submitted successfully! ✅</p>}
      </form>

      {submitted && (
        <>
          <StandardPreview formData={formData} onRefReady={setPreviewElement} />
          <DownloadToggle onDownload={handleDownload} />
        </>
      )}
    </div>
  );
}
