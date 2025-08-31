// src/components/StandardPreview.tsx

import React, { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { RetainerFormData } from '../../types/RetainerFormData.js';
import { getSerializedClauses } from '../../utils/serializeClauses';
import { FormType } from '@/types/FormType';
import { formatRetainerTitle } from '@/utils/formatTitle';

export interface PreviewProps {
  html: string; // still used for PDF export
  onRefresh: () => void;
  metadata?: Record<string, any>;
  formData: RetainerFormData;
  formType: FormType;
}

export default function StandardPreview({
  html,
  onRefresh,
  metadata,
  formData,
  formType,
}: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const clauseComponents = getSerializedClauses(formData); // ✅ clauseTemplates built internally

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
      <div ref={previewRef} className={styles.retainerPreview}>
        <h2 className={styles.retainerTitle}>
          {formatRetainerTitle(formType)}
        </h2>
        {Object.values(clauseComponents).map((Clause, i) => (
          <React.Fragment key={i}>{Clause}</React.Fragment>
        ))}
      </div>

      <DownloadToggle onDownload={(type) => handleExport(type)} />
    </div>
  );
}
