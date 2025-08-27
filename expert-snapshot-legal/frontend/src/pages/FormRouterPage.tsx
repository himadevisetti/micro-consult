import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StandardRetainerFlow from '../components/FormFlows/StandardRetainerFlow';
import IPCounselForm from '../components/FormFlows/IPCounselForm';
import CustomUploadForm from '../components/FormFlows/CustomUploadForm';
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';

const FormRouterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const template = queryParams.get('template')?.toLowerCase();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validTemplates = Object.values(FormType);

    if (!template || !validTemplates.includes(template as FormType)) {
      navigate('/');
      return;
    }

    setIsValid(true);
  }, [template, navigate]);

  const renderForm = () => {
    switch (template) {
      case FormType.StandardRetainer:
        return <StandardRetainerFlow />;
      case FormType.IPCounselRetainer:
        return <IPCounselForm />;
      case FormType.CustomTemplate:
        return <CustomUploadForm />;
      default:
        return null;
    }
  };

  const handleHomeClick = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <PageLayout onHomeClick={handleHomeClick}>
      {isValid && renderForm()}
    </PageLayout>
  );
};

export default FormRouterPage;
