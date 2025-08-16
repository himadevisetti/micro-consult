import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StandardPreview from '../components/AgreementPreview/StandardPreview';

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

  const onRefresh = () => {
    navigate('/builder?template=standard-retainer');
  };

  return <StandardPreview html={previewHtml} onRefresh={onRefresh} metadata={metadata} formData={formData} />;
}
