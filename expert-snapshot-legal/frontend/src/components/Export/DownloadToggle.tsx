// src/components/Export/DownloadToggle.tsx

import { useState } from "react";
import styles from "../../styles/ExportToggle.module.css";

export default function DownloadToggle({
  onDownload,
  showDocx = true,
  showPdf = true,
}: {
  onDownload: (type: "pdf" | "docx") => Promise<void>; // 🔧 updated type
  showDocx?: boolean;
  showPdf?: boolean;
}) {
  const [downloadingType, setDownloadingType] = useState<"pdf" | "docx" | null>(null);
  const hasMultiple = showDocx && showPdf;

  const handleClick = async (type: "pdf" | "docx") => {
    if (downloadingType) return; // 🔒 prevent re-entry
    try {
      setDownloadingType(type);
      await onDownload(type);
    } catch (err) {
      console.error("Download failed", { type, error: err });
    } finally {
      setDownloadingType(null);
    }
  };

  const renderLabel = (type: "pdf" | "docx", label: string) =>
    downloadingType === type ? (
      <span className={styles.spinnerWrapper}>
        <span className={styles.spinner} /> Downloading…
      </span>
    ) : (
      label
    );

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
          disabled={downloadingType === "docx"}
          onClick={() => handleClick("docx")}
        >
          {renderLabel("docx", "📝 Editable (.docx)")}
        </button>
      )}
      {showPdf && (
        <button
          className={styles.downloadButton}
          disabled={downloadingType === "pdf"}
          onClick={() => handleClick("pdf")}
        >
          {renderLabel("pdf", "🧾 Final (.pdf)")}
        </button>
      )}
    </div>
  );
}
