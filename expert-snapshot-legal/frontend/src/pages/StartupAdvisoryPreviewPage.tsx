// src/pages/StartupAdvisoryPreviewPage.tsx

import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StartupPreview from '../components/AgreementPreview/StartupPreview';
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';
import type { StartupAdvisoryFormData } from '../types/StartupAdvisoryFormData';

export default function StartupAdvisoryPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { type } = useParams(); // 'startup-advisory', etc.
  const formType = type as FormType;

  const formData = location.state?.formData as StartupAdvisoryFormData;
  const previewHtml = location.state?.previewHtml;
  const metadata = location.state?.metadata;

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
    navigate(`/form/${formType}`, {
      state: { formData, metadata },
    });
  };

  const onRefresh = () => {
    navigate(`/form/${formType}`);
  };

  return (
    <PageLayout onHomeClick={onHomeClick} onBackClick={onBackClick} scrollable>
      <StartupPreview
        html={previewHtml}
        onRefresh={onRefresh}
        metadata={metadata}
        formData={formData}
        formType={formType}
      />
    </PageLayout>
  );
}

