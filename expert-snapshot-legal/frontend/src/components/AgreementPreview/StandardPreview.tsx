import { useRef } from 'react';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';

export interface PreviewProps {
  html: string;
  onRefresh: () => void;
  metadata?: Record<string, any>; // Optional, for future extensibility
}

export default function StandardPreview({ html, onRefresh, metadata = {} }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    const content = previewRef.current?.innerHTML;
    if (!content) {
      console.warn('No content found in previewRef for PDF export.');
      return;
    }

    try {
      await exportRetainer('pdf', metadata, content);
    } catch (err) {
      console.error('PDF export failed in StandardPreview:', err);
    }
  };

  const handleExportDOCX = async () => {
    try {
      await exportRetainer('docx', metadata);
    } catch (err) {
      console.error('DOCX export failed in StandardPreview:', err);
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h2 className={styles.retainerTitle}>Legal Retainer Agreement</h2>
        <button onClick={onRefresh}>🔄 Refresh Preview</button>
      </div>

      <div
        ref={previewRef}
        className={styles.retainerPreview}
        dangerouslySetInnerHTML={{ __html: html }}
      />

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
