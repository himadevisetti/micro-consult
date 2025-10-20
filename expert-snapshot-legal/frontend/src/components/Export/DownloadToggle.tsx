// src/components/Export/DownloadToggle.tsx
import styles from "../../styles/ExportToggle.module.css";

export default function DownloadToggle({
  onDownload,
  showDocx = true,
  showPdf = true,
}: {
  onDownload: (type: "pdf" | "docx") => void;
  showDocx?: boolean;
  showPdf?: boolean;
}) {
  const hasMultiple = showDocx && showPdf;

  return (
    <div className={styles.downloadToggle}>
      {hasMultiple && (
        <span>
          <strong>Download As:</strong>
        </span>
      )}
      {showDocx && (
        <button
          className={styles.downloadButton}
          onClick={() => onDownload("docx")}
        >
          📝 Editable (.docx)
        </button>
      )}
      {showPdf && (
        <button
          className={styles.downloadButton}
          onClick={() => onDownload("pdf")}
        >
          🧾 Final (.pdf)
        </button>
      )}
    </div>
  );
}
