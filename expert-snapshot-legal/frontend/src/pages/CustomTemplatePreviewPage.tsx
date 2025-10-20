// src/pages/CustomTemplatePreviewPage.tsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import CustomTemplatePreview from '../components/AgreementPreview/CustomTemplatePreview';
import { FormType } from '@/types/FormType';

export default function CustomTemplatePreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const formType = FormType.CustomTemplateGenerate;

  const formData = location.state?.formData as Record<string, string>;
  const templateFile = location.state?.templateFile as string;
  const previewHtml = location.state?.previewHtml as string;
  const metadata = location.state?.metadata as Record<string, any> | undefined;
  const customerId = location.state?.customerId as string | undefined;
  const templateId = location.state?.templateId as string | undefined;

  // Extract templateType from metadata
  const templateType = (metadata?.templateType ?? "docx") as "docx" | "pdf";

  useEffect(() => {
    if (!formData || !previewHtml) {
      navigate(`/form/${formType}`, { replace: true });
    }
  }, [formData, previewHtml, navigate, formType]);

  if (!formData || !previewHtml) {
    return (
      <PageLayout scrollable>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>
            Preview data missing. Redirecting to builder for{' '}
            <strong>{formType}</strong>...
          </p>
        </div>
      </PageLayout>
    );
  }

  const onHomeClick = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const onBackClick = () => {
    navigate(`/form/${formType}/${templateId}`, {
      state: { formData, templateFile, metadata, customerId, templateId },
    });
  };

  const onTemplateClick = () => {
    navigate('/form/custom-template');
  };

  const onRefresh = () => {
    navigate(`/form/${formType}`);
  };

  return (
    <PageLayout
      onHomeClick={onHomeClick}
      onBackClick={onBackClick}
      onTemplateClick={onTemplateClick}
      scrollable
    >
      <CustomTemplatePreview
        html={previewHtml}
        onRefresh={onRefresh}
        metadata={metadata}
        formData={formData}
        formType={formType}
        customerId={customerId}
        templateId={templateId}
        templateType={templateType}
      />
    </PageLayout>
  );
}
