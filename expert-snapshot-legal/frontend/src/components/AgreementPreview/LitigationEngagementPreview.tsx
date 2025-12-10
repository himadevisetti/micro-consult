// src/components/AgreementPreview/LitigationEngagementPreview.tsx

import React, { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { LitigationEngagementFormData } from '../../types/LitigationEngagementFormData';
import { getSerializedLitigationEngagementClauses } from '../../utils/serializeLitigationEngagementClauses';
import { FormType } from '@/types/FormType';
import { formatRetainerTitle } from '@/utils/formatTitle';
import { useFlowCompletedTelemetry } from '../../hooks/useFlowCompletedTelemetry';

export interface LitigationEngagementPreviewProps {
  html: string;
  onRefresh: () => void;
  metadata?: Record<string, any>;
  formData: LitigationEngagementFormData;
  formType: FormType;
}

export default function LitigationEngagementPreview({
  html,
  onRefresh,
  metadata,
  formData,
  formType,
}: LitigationEngagementPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const clauseComponents = getSerializedLitigationEngagementClauses(formData);

  useFlowCompletedTelemetry({
    flowName: formType,
    fieldCount: Object.keys(formData).length,
    customerId: metadata?.customerId,
  });

  const handleExport = async (type: 'pdf' | 'docx') => {
    const content = previewRef.current?.innerHTML;
    if (!content) {
      console.warn(`No content found in previewRef for ${type.toUpperCase()} export.`);
      return;
    }

    try {
      await exportRetainer(type, formType, formData, content);
    } catch (err) {
      console.error(`${type.toUpperCase()} export failed in LitigationEngagementPreview:`, err);
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

