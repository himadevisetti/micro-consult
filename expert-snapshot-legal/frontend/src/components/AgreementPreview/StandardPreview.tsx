import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/StandardPreview.module.css';
import { exportRetainer } from '../../utils/export/exportHandler';
import DownloadToggle from '../Export/DownloadToggle';
import type { RetainerFormData } from '../../types/RetainerFormData.js';

export interface PreviewProps {
  html: string;
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
    try {
      await exportRetainer('docx', formData);
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
