import { useEffect, useRef } from 'react';
import { getClauses } from '../AgreementClauses/clauses.js';
import SignatureClause from '../AgreementClauses/SignatureClause.js';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler.js';
import DownloadToggle from '../Export/DownloadToggle.js';

export interface PreviewProps {
  formData: Record<string, string>;
  onRefReady?: (element: HTMLElement | null) => void;
}

export default function StandardPreview({ formData, onRefReady }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onRefReady && previewRef.current) {
      onRefReady(previewRef.current);
    }
  }, [onRefReady]);

  const clauses = getClauses(formData);

  const handleExportPDF = async () => {
    const html = previewRef.current?.innerHTML;
    if (!html) return;

    try {
      await exportRetainer('pdf', formData, html);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const handleExportDOCX = async () => {
    try {
      await exportRetainer('docx', formData);
    } catch (err) {
      console.error('DOCX export failed:', err);
    }
  };

  return (
    <div>
      <div ref={previewRef} className={styles.retainerPreview}>
        <h2 className={styles.retainerTitle}>Legal Retainer Agreement</h2>

        <div className={styles.clausesFlow}>
          {clauses.map((clause, index) => (
            <div key={index} className={styles.clauseBlock}>
              {clause}
            </div>
          ))}
        </div>

        <div className={styles.signatureWrapper}>
          <div className={styles.signatureBlock}>
            <SignatureClause
              clientName={formData.clientName}
              legalGroup="Expert Snapshot Legal"
              executionDate={formData.startDate}
            />
          </div>
        </div>
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
