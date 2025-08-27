import React, { useRef } from 'react';
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
  const clauseComponents = getSerializedClauses(formData);

  const handleExport = async (type: 'pdf' | 'docx') => {
    const content = previewRef.current?.innerHTML;
    if (!content) {
      console.warn(`No content found in previewRef for ${type.toUpperCase()} export.`);
      return;
    }

    try {
      await exportRetainer(type, formData, content);
    } catch (err) {
      console.error(`${type.toUpperCase()} export failed in StandardPreview:`, err);
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div
        ref={previewRef}
        className={styles.retainerPreview}
      >
        <h2 className={styles.retainerTitle}>
          STANDARD RETAINER AGREEMENT
        </h2>
        {Object.values(clauseComponents).map((Clause, i) => (
          <div key={i} className={styles.clauseBlock}>
            {Clause}
          </div>
        ))}
      </div>

      <DownloadToggle
        onDownload={(type) => handleExport(type)}
      />
    </div>
  );
}
