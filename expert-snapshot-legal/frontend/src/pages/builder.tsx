import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import StandardRetainerForm from '../components/FormFlows/StandardRetainerForm';
import IPCounselForm from '../components/FormFlows/IPCounselForm';
import CustomUploadForm from '../components/FormFlows/CustomUploadForm';

const Builder = () => {
  const router = useRouter();
  const { template } = router.query;
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (typeof template !== 'string') return;

    const validTemplates = ['standard-retainer', 'ip-counsel-retainer', 'custom-upload'];
    setIsValid(validTemplates.includes(template.toLowerCase()));

    if (!validTemplates.includes(template.toLowerCase())) {
      router.replace('/');
    }
  }, [template, router]);

  const renderForm = () => {

    const normalizedTemplate =
      Array.isArray(template) ? template[0]?.toLowerCase() ?? '' : template?.toLowerCase() ?? '';

    switch (normalizedTemplate) {
      case 'standard-retainer':
        return <StandardRetainerForm />;
      case 'ip-counsel-retainer':
        return <IPCounselForm />;
      case 'custom-upload':
        return <CustomUploadForm />;
      default:
        return null;
    }
  };

  return (
    <div className="form-section">{isValid ? renderForm() : <p>🔄 Loading builder...</p>}</div>
  );
};

export default Builder;
