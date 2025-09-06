// src/components/AgreementPreview/StartupPreview.tsx

import React, { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { StartupAdvisoryFormData } from '../../types/StartupAdvisoryFormData';
import { getSerializedStartupAdvisoryClauses } from '../../utils/serializeStartupAdvisoryClauses';
import { FormType } from '@/types/FormType';
import { formatRetainerTitle } from '@/utils/formatTitle';

export interface StartupPreviewProps {
  html: string; // still used for PDF export
  onRefresh: () => void;
  metadata?: Record<string, any>;
  formData: StartupAdvisoryFormData;
  formType: FormType;
}

export default function StartupPreview({
  html,
  onRefresh,
  metadata,
  formData,
  formType,
}: StartupPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const clauseComponents = getSerializedStartupAdvisoryClauses(formData);

  const handleExport = async (type: 'pdf' | 'docx') => {
    const content = previewRef.current?.innerHTML;
    if (!content) {
      console.warn(`No content found in previewRef for ${type.toUpperCase()} export.`);
      return;
    }

    try {
      await exportRetainer(type, formType, formData, content);
    } catch (err) {
      console.error(`${type.toUpperCase()} export failed in StartupPreview:`, err);
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

