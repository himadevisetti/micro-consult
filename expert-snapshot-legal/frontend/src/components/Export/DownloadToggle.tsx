import styles from '../../styles/ExportToggle.module.css';

export default function DownloadToggle({
  onDownload,
}: {
  onDownload: (type: 'pdf' | 'docx') => void;
}) {
  return (
    <div className={styles.downloadToggle}>
      <p>
        <strong>Download As:</strong>
      </p>
      <button className={styles.downloadButton} onClick={() => onDownload('docx')}>
        📝 Editable (.docx)
      </button>
      <button className={styles.downloadButton} onClick={() => onDownload('pdf')}>
        🧾 Final (.pdf)
      </button>
    </div>
  );
}
