// src/components/AgreementPreview/RealEstateContractPreview.tsx

import React, { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { RealEstateContractFormData } from '../../types/RealEstateContractFormData';
import { getSerializedRealEstateContractClauses } from '../../utils/serializeRealEstateContractClauses';
import { FormType } from '@/types/FormType';
import { formatRetainerTitle } from '@/utils/formatTitle';
import { useFlowCompletedTelemetry } from '../../hooks/useFlowCompletedTelemetry';

export interface RealEstateContractPreviewProps {
  html: string;
  onRefresh: () => void;
  metadata?: Record<string, any>;
  formData: RealEstateContractFormData;
  formType: FormType;
}

export default function RealEstateContractPreview({
  html,
  onRefresh,
  metadata,
  formData,
  formType,
}: RealEstateContractPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const clauseComponents = getSerializedRealEstateContractClauses(formData);

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
      console.error(`${type.toUpperCase()} export failed in RealEstateContractPreview:`, err);
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
