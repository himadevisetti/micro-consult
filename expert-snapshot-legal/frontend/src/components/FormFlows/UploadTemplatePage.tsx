// src/components/FormFlows/UploadTemplatePage.tsx
import React, { useState } from 'react';
import styles from '../../styles/StandardRetainerForm.module.css';
import { TemplateVariable } from '../../types/templates';

interface Props {
  customerId: string;
  onUploadComplete: (
    templateId: string,
    name: string,
    candidates: TemplateVariable[]
  ) => void;
}

export default function UploadTemplatePage({ customerId, onUploadComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/templates/${customerId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let message = `Upload failed: ${res.statusText}`;
        try {
          const errorData = await res.json();
          if (errorData?.error) {
            message = `Upload failed: ${errorData.error}`;
          }
        } catch {
          if (res.status === 400) {
            message =
              'Upload failed: File type you uploaded is currently unsupported. Only DOCX and PDF are supported.';
          } else if (res.status >= 500) {
            message = 'Upload failed: Server error. Please try again later.';
          } else {
            message = 'Upload failed: Network or unexpected error.';
          }
        }
        throw new Error(message);
      }

      const data = await res.json();
      onUploadComplete(data.templateId, data.name, data.candidates || []);
    } catch (err: any) {
      // Network errors (e.g. server unreachable) will land here too
      setError(err.message || 'Upload failed: Network error, please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <form className={styles.formInner} onSubmit={handleUpload}>
        <h2 className={styles.formTitle}>📂 Upload Template</h2>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.uploadRow}>
          <label htmlFor="templateFile" className={styles.uploadLabel}>
            Select a DOCX or PDF template
          </label>
          <div className={styles.uploadInputWrapper}>
            <input
              id="templateFile"
              type="file"
              accept=".docx,.pdf"
              onChange={handleFileChange}
              className={`${styles.input} ${styles.uploadInput}`}
            />
          </div>
        </div>

        <div className={styles.submitRow}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  );
}
