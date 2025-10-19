// src/App.tsx
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RetainerFormPage from './pages/RetainerFormPage';
import RetainerPreviewPage from './pages/RetainerPreviewPage';
import IPRightsLicensingPreviewPage from './pages/IPRightsLicensingPreviewPage';
import StartupAdvisoryPreviewPage from './pages/StartupAdvisoryPreviewPage';
import EmploymentAgreementPreviewPage from './pages/EmploymentAgreementPreviewPage';
import CustomTemplatePreviewPage from './pages/CustomTemplatePreviewPage';
import { FormType } from '@/types/FormType';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* ⬇️ allow optional :templateId for generate flow */}
        <Route path="/form/:type/:templateId?" element={<RetainerFormPage />} />
        <Route path="/preview/:type" element={<PreviewRouter />} />
      </Routes>
    </BrowserRouter>
  );
}

function PreviewRouter() {
  const { type } = useParams();

  switch (type) {
    case FormType.IPRightsLicensing:
      return <IPRightsLicensingPreviewPage />;
    case FormType.StandardRetainer:
      return <RetainerPreviewPage />;
    case FormType.StartupAdvisory:
      return <StartupAdvisoryPreviewPage />;
    case FormType.EmploymentAgreement:
      return <EmploymentAgreementPreviewPage />;
    case FormType.CustomTemplateGenerate:
      return <CustomTemplatePreviewPage />;
    default:
      return <div>Unknown preview type: {type}</div>;
  }
}
