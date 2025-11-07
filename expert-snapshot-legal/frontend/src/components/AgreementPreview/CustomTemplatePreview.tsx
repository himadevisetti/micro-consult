// src/components/AgreementPreview/CustomTemplatePreview.tsx

import React, { useRef } from "react";
import styles from "../../styles/StandardPreview.module.css";
import { exportRetainer } from "../../utils/export/exportHandler";
import DownloadToggle from "../Export/DownloadToggle";
import { FormType } from "@/types/FormType";
import { logWarn } from "../../utils/logger";
import { arrayBufferToBase64 } from "../../utils/arrayBufferToBase64";

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
      if (type === "docx") {
        // DOCX export still uses preview HTML
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
      } else if (type === "pdf") {
        // 🔹 For PDF, call exportRetainer with docxBufferBase64 so backend converts DOCX → PDF
        let docxBufferBase64: string | undefined;

        if (formType === FormType.CustomTemplateGenerate && customerId && templateId) {
          // fetch merged DOCX buffer from /generate
          const res = await fetch(
            `/api/templates/${encodeURIComponent(customerId)}/${encodeURIComponent(templateId)}/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ variables: formData, format: "docx" }),
            }
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch DOCX buffer for PDF export: ${res.statusText}`);
          }
          const arrayBuffer = await res.arrayBuffer();
          docxBufferBase64 = arrayBufferToBase64(arrayBuffer);
        }

        await exportRetainer(
          type,
          formType,
          formData,
          previewRef.current?.innerHTML,
          customerId,
          templateId,
          docxBufferBase64
        );
      }
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
