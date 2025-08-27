import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StandardPreview from '../components/AgreementPreview/StandardPreview';
import PageLayout from '../components/PageLayout';

export default function StandardRetainerPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;
  const previewHtml = location.state?.previewHtml;
  const metadata = location.state?.metadata;

  useEffect(() => {
    if (formData === undefined || previewHtml === undefined) {
      navigate('/builder?template=standard-retainer', { replace: true });
    }
  }, [formData, previewHtml, navigate]);

  if (!formData || !previewHtml) {
    return <p>🔄 Redirecting to builder...</p>;
  }

  const onHomeClick = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const onBackClick = () => {
    navigate('/builder?template=standard-retainer', {
      state: { formData, metadata },
    });
  };

  const onRefresh = () => {
    navigate('/builder?template=standard-retainer');
  };

  return (
    <PageLayout onHomeClick={onHomeClick} onBackClick={onBackClick} scrollable>
      <StandardPreview
        html={previewHtml}
        onRefresh={onRefresh}
        metadata={metadata}
        formData={formData}
      />
    </PageLayout>
  );
}
