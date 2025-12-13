// src/pages/RealEstateContractPreviewPage.tsx

import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import RealEstateContractPreview from '../components/AgreementPreview/RealEstateContractPreview';
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';
import type { RealEstateContractFormData } from '../types/RealEstateContractFormData';
import { clearFormState } from '@/utils/clearFormState';

export default function RealEstateContractPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { type } = useParams(); // 'real-estate-contract', etc.
  const formType = type as FormType;

  const formData = location.state?.formData as RealEstateContractFormData;
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
    clearFormState();
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
      <RealEstateContractPreview
        html={previewHtml}
        onRefresh={onRefresh}
        metadata={metadata}
        formData={formData}
        formType={formType}
      />
    </PageLayout>
  );
}
