// src/components/FormFlows/CustomTemplateFlow.tsx
import CustomTemplatePage from '@/pages/CustomTemplatePage';

interface CustomTemplateFlowProps {
  customerId: string;
}

const CustomTemplateFlow = ({ customerId }: CustomTemplateFlowProps) => {
  // Wrapper to keep consistent with other Flow components
  return <CustomTemplatePage customerId={customerId} />;
};

export default CustomTemplateFlow;
