// src/pages/FamilyLawAgreementPreviewPage.tsx

import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import FamilyLawAgreementPreview from '../components/AgreementPreview/FamilyLawAgreementPreview';
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';
import type { FamilyLawAgreementFormData } from '../types/FamilyLawAgreementFormData';
import { clearFormState } from '@/utils/clearFormState';

export default function FamilyLawAgreementPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { type } = useParams(); // 'family-law-agreement', etc.
  const formType = type as FormType;

  const formData = location.state?.formData as FamilyLawAgreementFormData;
  const previewHtml = location.state?.previewHtml;
  const metadata = location.state?.metadata;
  const lastStepKey = location.state?.lastStepKey as string | undefined;

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
    if (lastStepKey) {
      navigate(`/form/${formType}/${lastStepKey}`, {
        state: { formData, metadata, agreementTypes: [lastStepKey] },
      });
    } else {
      navigate(`/form/${formType}`, {
        state: { formData, metadata },
      });
    }
  };

  const onRefresh = () => {
    navigate(`/form/${formType}`);
  };

  return (
    <PageLayout onHomeClick={onHomeClick} onBackClick={onBackClick} scrollable>
      <FamilyLawAgreementPreview
        html={previewHtml}
        onRefresh={onRefresh}
        metadata={metadata}
        formData={formData}
        formType={formType}
      />
    </PageLayout>
  );
}
