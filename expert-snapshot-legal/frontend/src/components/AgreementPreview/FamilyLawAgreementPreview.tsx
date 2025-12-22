// src/components/AgreementPreview/FamilyLawAgreementPreview.tsx

import React, { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { FamilyLawAgreementFormData } from '../../types/FamilyLawAgreementFormData';
import { getSerializedFamilyLawAgreementClauses } from '../../utils/serializeFamilyLawAgreementClauses';
import { FormType } from '@/types/FormType';
import { formatRetainerTitle } from '@/utils/formatTitle';
import { useFlowCompletedTelemetry } from '../../hooks/useFlowCompletedTelemetry';

export interface FamilyLawAgreementPreviewProps {
  html: string;
  onRefresh: () => void;
  metadata?: Record<string, any>;
  formData: FamilyLawAgreementFormData;
  formType: FormType;
}

export default function FamilyLawAgreementPreview({
  html,
  onRefresh,
  metadata,
  formData,
  formType,
}: FamilyLawAgreementPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const clauseComponents = getSerializedFamilyLawAgreementClauses(formData);

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
      console.error(`${type.toUpperCase()} export failed in FamilyLawAgreementPreview:`, err);
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

