// src/components/AgreementPreview/EmploymentAgreementPreview.tsx

import React, { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { EmploymentAgreementFormData } from '../../types/EmploymentAgreementFormData';
import { getSerializedEmploymentAgreementClauses } from '../../utils/serializeEmploymentAgreementClauses';
import { FormType } from '@/types/FormType';
import { formatRetainerTitle } from '@/utils/formatTitle';
import { useFlowCompletedTelemetry } from '../../hooks/useFlowCompletedTelemetry';

export interface EmploymentAgreementPreviewProps {
  html: string;
  onRefresh: () => void;
  metadata?: Record<string, any>;
  formData: EmploymentAgreementFormData;
  formType: FormType;
}

export default function EmploymentAgreementPreview({
  html,
  onRefresh,
  metadata,
  formData,
  formType,
}: EmploymentAgreementPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const clauseComponents = getSerializedEmploymentAgreementClauses(formData);

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
      console.error(`${type.toUpperCase()} export failed in EmploymentAgreementPreview:`, err);
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
