import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StandardRetainerFlow from '../components/FormFlows/StandardRetainerFlow';
import IPCounselForm from '../components/FormFlows/IPCounselForm';
import CustomUploadForm from '../components/FormFlows/CustomUploadForm';
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';
import { formSchemas } from '../schemas/formSchemas';
import { RetainerFieldConfig } from '@/types/RetainerFieldConfig';

const RetainerFormPage = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // e.g. 'standard-retainer', 'ip-counsel-retainer'

  const isValidType = type && Object.values(FormType).includes(type as FormType);
  const formType = isValidType ? (type as FormType) : FormType.StandardRetainer;
  const schema = formSchemas[formType] as Record<string, RetainerFieldConfig>;

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
        return <StandardRetainerFlow schema={schema} />;

      // case FormType.IPCounselRetainer:
      //   return <IPCounselForm schema={schema} />;

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
