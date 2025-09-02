// src/pages/RetainerFormPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StandardRetainerFlow from '../components/FormFlows/StandardRetainerFlow';
import IPRightsLicensingFlow from '../components/FormFlows/IPRightsLicensingFlow';
// import CustomUploadForm from '../components/FormFlows/CustomUploadForm'; // keep commented until used
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';
import { formSchemas } from '../schemas/formSchemas';

const RetainerFormPage = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // e.g. 'standard-retainer', 'ip-rights-licensing'

  const isValidType = type && Object.values(FormType).includes(type as FormType);
  const formType = isValidType ? (type as FormType) : FormType.StandardRetainer;

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!isValidType) {
      navigate('/');
      return;
    }
    setIsValid(true);
  }, [isValidType, navigate]);

  const renderForm = () => {
    switch (formType) {
      case FormType.StandardRetainer:
        return <StandardRetainerFlow schema={formSchemas[FormType.StandardRetainer]} />;

      case FormType.IPRightsLicensing:
        return <IPRightsLicensingFlow schema={formSchemas[FormType.IPRightsLicensing]} />;

      // case FormType.CustomTemplate:
      //   return <CustomUploadForm />;

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

export default RetainerFormPage;
