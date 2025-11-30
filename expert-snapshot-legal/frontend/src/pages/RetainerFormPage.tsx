// src/pages/RetainerFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StandardRetainerFlow from '../components/FormFlows/StandardRetainerFlow';
import IPRightsLicensingFlow from '../components/FormFlows/IPRightsLicensingFlow';
import StartupAdvisoryFlow from '../components/FormFlows/StartupAdvisoryFlow';
import EmploymentAgreementFlow from '../components/FormFlows/EmploymentAgreementFlow';
import CustomTemplateFlow from '../components/FormFlows/CustomTemplateFlow';
import GenerateDocumentFlow from '../components/FormFlows/GenerateDocumentFlow';
import PageLayout from '../components/PageLayout';
import { FormType } from '@/types/FormType';
import { formSchemas } from '../schemas/formSchemas';
import UploadTemplateFlow from '../components/FormFlows/UploadTemplateFlow';
import PlaceholderFlow from '../components/FormFlows/PlaceholderFlow';
import { getDecodedToken } from '@/utils/authToken';
import { clearFormState } from '@/utils/clearFormState';

const RetainerFormPage = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  const isValidType = type && Object.values(FormType).includes(type as FormType);
  const formType = isValidType ? (type as FormType) : FormType.StandardRetainer;

  const [isValid, setIsValid] = useState(false);

  // 🔹 Decode once at top
  const decoded = getDecodedToken();
  const customerId = decoded?.customerId ?? "anonymous";

  useEffect(() => {
    if (!isValidType) {
      navigate('/');
      return;
    }
    setIsValid(true);
  }, [isValidType, navigate]);

  const handleHomeClick = () => {
    clearFormState();
    navigate('/');
  };

  const handleBackClick = () => {
    switch (formType) {
      case FormType.CustomTemplateGenerate:
      case FormType.CustomTemplateUpload:
        navigate('/form/custom-template');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const getMainHeading = () => {
    if (formType === FormType.CustomTemplate) {
      return 'Custom Template';
    }
    return undefined;
  };

  const renderForm = () => {
    switch (formType) {
      case FormType.StandardRetainer:
        return <StandardRetainerFlow schema={formSchemas[FormType.StandardRetainer]} />;

      case FormType.IPRightsLicensing:
        return <IPRightsLicensingFlow schema={formSchemas[FormType.IPRightsLicensing]} />;

      case FormType.StartupAdvisory:
        return <StartupAdvisoryFlow schema={formSchemas[FormType.StartupAdvisory]} />;

      case FormType.EmploymentAgreement:
        return <EmploymentAgreementFlow schema={formSchemas[FormType.EmploymentAgreement]} />;

      case FormType.CustomTemplate:
        return <CustomTemplateFlow customerId={customerId} />;

      case FormType.CustomTemplateUpload:
        return <UploadTemplateFlow customerId={customerId} />;

      case FormType.CustomTemplateGenerate:
        return <GenerateDocumentFlow customerId={customerId} />;

      case FormType.LitigationEngagement:
      case FormType.RealEstateContract:
      case FormType.FamilyLawAgreement:
        return <PlaceholderFlow formType={formType} />;

      default:
        return null;
    }
  };

  return (
    <PageLayout
      onHomeClick={handleHomeClick}
      onBackClick={handleBackClick}
      mainHeading={getMainHeading()}
    >
      {isValid && renderForm()}
    </PageLayout>
  );
};

export default RetainerFormPage;
