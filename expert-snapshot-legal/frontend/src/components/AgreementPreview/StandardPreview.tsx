import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { RetainerFormData } from '../../types/RetainerFormData.js';
import { getSerializedClauses } from '../../utils/serializeClauses';

export interface PreviewProps {
  html: string; // still used for PDF export
  onRefresh: () => void;
  metadata?: Record<string, any>;
  formData: RetainerFormData;
}

export default function StandardPreview({
  html,
  onRefresh,
  metadata,
  formData,
}: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const clauseComponents = getSerializedClauses(formData);

  const handleExportPDF = async () => {
    const content = previewRef.current?.innerHTML;
    if (!content) {
      console.warn('No content found in previewRef for PDF export.');
      return;
    }

    try {
      await exportRetainer('pdf', formData, content);
    } catch (err) {
      console.error('PDF export failed in StandardPreview:', err);
    }
  };

  const handleExportDOCX = async () => {
    const content = previewRef.current?.innerHTML;
    if (!content) {
      console.warn('No content found in previewRef for DOCX export.');
      return;
    }

    try {
      await exportRetainer('docx', formData, content);
    } catch (err) {
      console.error('DOCX export failed in StandardPreview:', err);
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <button onClick={() => navigate('/builder?template=standard-retainer')}>
          ⬅️ Back to Form
        </button>
      </div>

      <div
        ref={previewRef}
        className={styles.retainerPreview}
      >
        <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>
          STANDARD RETAINER AGREEMENT
        </h2>
        {Object.values(clauseComponents).map((Clause, i) => (
          <React.Fragment key={i}>
            <div className={styles.clauseBlock}>
              {Clause}
            </div>
          </React.Fragment>
        ))}
      </div>

      <DownloadToggle
        onDownload={(type) => {
          if (type === 'pdf') {
            handleExportPDF();
          } else if (type === 'docx') {
            handleExportDOCX();
          }
        }}
      />
    </div>
  );
}
