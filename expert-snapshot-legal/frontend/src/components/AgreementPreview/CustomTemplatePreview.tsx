// src/components/AgreementPreview/CustomTemplatePreview.tsx

import React, { useRef } from "react";
import styles from "../../styles/StandardPreview.module.css";
import { exportRetainer } from "../../utils/export/exportHandler";
import DownloadToggle from "../Export/DownloadToggle";
import { FormType } from "@/types/FormType";
import { logWarn } from "../../utils/logger";

export interface CustomTemplatePreviewProps {
  html: string; // preview HTML returned from /generate
  onRefresh: () => void;
  formData: Record<string, string>;
  formType: FormType;
  customerId?: string;
  templateId?: string;
  seedType: "docx" | "pdf";
}

export default function CustomTemplatePreview({
  html,
  onRefresh,
  formData,
  formType,
  customerId,
  templateId,
  seedType,
}: CustomTemplatePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExport = async (type: "pdf" | "docx") => {
    try {
      const content = previewRef.current?.innerHTML;
      if (!content) {
        logWarn("CustomTemplatePreview.export.noContent", { type });
        return;
      }

      await exportRetainer(
        type,
        formType,
        formData,
        content,
        customerId,
        templateId
      );
    } catch (err) {
      console.error("CustomTemplatePreview.export.error", { type, error: err });
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div ref={previewRef} className={styles.retainerPreview}>
        <h2 className={styles.retainerTitle}>Custom Template Preview</h2>
        {/* Render the HTML preview returned from backend */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <DownloadToggle
        onDownload={(type) => handleExport(type)}
        showDocx={seedType === "docx" || seedType === "pdf"} // always allow DOCX export
        showPdf={seedType === "pdf"}                         // only show PDF if seed was PDF
      />
    </div>
  );
}
