// src/utils/export/exportHandler.ts

/**
 * Hybrid export model (updated, unified pipeline):
 *
 * - Preview HTML:
 *   Returned from backend `/generate` with format=html,
 *   then rendered directly in the preview page.
 *
 * - DOCX (standard flows):
 *   Generated client‑side with generateDOCX() for responsiveness.
 *   This path is used for Retainer, Startup Advisory, Employment, etc.
 *
 * - DOCX (Custom Template Generate flow):
 *   Now unified with backend `/generate` route.
 *   The backend loads the seed DOCX, runs Docxtemplater substitution once,
 *   and returns the merged DOCX. This ensures pixel‑perfect fidelity
 *   and avoids duplicating substitution logic on the frontend.
 *
 * - PDF:
 *   Generated server‑side via /api/exportPdf for fidelity (slower).
 *
 * This split is intentional:
 *   • Keep fast paths on the frontend for responsiveness.
 *   • Offload heavy PDF rendering and custom template substitution to the backend.
 *   • Preserve fidelity for user‑uploaded templates via Docxtemplater.
 */

import { generateDOCX } from './generateDOCX.js';
import { getFilename } from '../../utils/generateFilename.js';
import { FormType, RetainerTypeLabel } from '@/types/FormType';

function slugifyFormType(formType: FormType): string {
  return String(formType)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // collapse non-alphanumerics to hyphens
    .replace(/^-+|-+$/g, '');      // trim leading/trailing hyphens
}

function resolveMetadata(formData: Record<string, any>, formType: FormType) {
  let client: string;
  let purpose: string;
  let extraMetadata: Record<string, string> = {};

  switch (formType) {
    case FormType.IPRightsLicensing:
      client = formData.clientName?.trim() || 'Client';
      purpose = 'IP rights licensing agreement';
      extraMetadata = {
        inventorName: formData.inventorName?.trim() || 'Inventor',
        providerName: formData.providerName?.trim() || 'Provider',
      };
      break;

    case FormType.StandardRetainer:
      client = formData.clientName?.trim() || 'Client';
      purpose = 'Standard retainer agreement';
      extraMetadata = {
        providerName: formData.providerName?.trim() || 'Service Provider',
      };
      break;

    case FormType.StartupAdvisory:
      client = formData.companyName?.trim() || 'Company';
      purpose = 'Startup advisory agreement';
      extraMetadata = {
        advisorName: formData.advisorName?.trim() || 'Advisor',
      };
      break;

    case FormType.EmploymentAgreement:
      client = formData.employeeName?.trim() || 'Employee';
      purpose = 'Employment agreement';
      extraMetadata = {
        employerName: formData.employerName?.trim() || 'Employer',
      };
      break;

    case FormType.LitigationEngagement:
      client = formData.clientName?.trim() || 'Client';
      purpose = 'Litigation engagement agreement';
      break;

    case FormType.RealEstateContract:
      client = formData.clientName?.trim() || 'Client';
      purpose = 'Real estate contract';
      break;

    case FormType.FamilyLawAgreement:
      client = formData.clientName?.trim() || 'Client';
      purpose = 'Family law agreement';
      break;

    case FormType.CustomTemplate:
    case FormType.CustomTemplateGenerate: {
      const candidateKeys = [
        'clientName',
        'companyName',
        'employeeName',
        'providerName',
        'advisorName',
        'inventorName',
        'partyA',
        'partyB',
      ];

      let identifier = '';
      for (const key of candidateKeys) {
        if (formData[key]) {
          identifier = String(formData[key]).trim();
          break;
        }
      }

      client = identifier || 'Document';
      purpose = 'Custom document';
      break;
    }

    default:
      client = formData.clientName?.trim() || 'Client';
      purpose = 'Legal services agreement';
      break;
  }

  return { client, purpose, extraMetadata };
}

export async function exportRetainer<T extends Record<string, any>>(
  type: "pdf" | "docx",
  formType: FormType,
  formData: T,
  html?: string,
  customerId?: string,
  templateId?: string,
  docxBufferBase64?: string // 🔹 new optional param
) {
  const { client: resolvedClient, purpose: resolvedMatter } =
    resolveMetadata(formData, formType);

  const normalizedFormType = slugifyFormType(formType);
  const today = new Date().toISOString();

  const filename = getFilename(
    type === "pdf" ? "final" : "draft",
    resolvedClient,
    today,
    normalizedFormType
  );

  let blob: Blob | null = null;

  try {
    if (type === "pdf") {
      // 🔹 Branch: Generate Document flow → send DOCX buffer
      if (formType === FormType.CustomTemplateGenerate && docxBufferBase64) {
        const response = await fetch("/api/exportPdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docxBufferBase64, filename }),
        });
        if (!response.ok) throw new Error(`PDF export failed: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: "application/pdf" });
      } else {
        // 🔹 Other flows → send HTML
        if (!html) throw new Error(`Missing HTML for PDF export`);
        const response = await fetch("/api/exportPdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html, filename }),
        });
        if (!response.ok) throw new Error(`PDF export failed: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: "application/pdf" });
      }
    } else if (type === "docx" && formType === FormType.CustomTemplateGenerate) {
      if (!customerId || !templateId) {
        throw new Error("Missing customerId or templateId for custom template export");
      }
      const response = await fetch(
        `/api/templates/${encodeURIComponent(customerId)}/${encodeURIComponent(templateId)}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variables: formData, format: "docx" }),
        }
      );
      if (!response.ok)
        throw new Error(`Custom template DOCX export failed: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    } else if (type === "docx") {
      if (!html) throw new Error(`Missing HTML for DOCX export`);
      blob = await generateDOCX({ html, filename });
    }
  } catch (err) {
    console.error(`[Export Error] Failed to generate ${type.toUpperCase()} blob:`, err);
    alert("Export failed. Please try again or contact support.");
    return;
  }

  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    console.warn("No file blob was generated for download.");
  }
}
