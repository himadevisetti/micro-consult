// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RetainerFormPage from './pages/RetainerFormPage';
import RetainerPreviewPage from './pages/RetainerPreviewPage';
import IPRightsLicensingPreviewPage from './pages/IPRightsLicensingPreviewPage';
import StartupAdvisoryPreviewPage from './pages/StartupAdvisoryPreviewPage';
import EmploymentAgreementPreviewPage from './pages/EmploymentAgreementPreviewPage';
import CustomTemplatePreviewPage from './pages/CustomTemplatePreviewPage';
import LitigationEngagementPreviewPage from './pages/LitigationEngagementPreviewPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import MicrosoftCallbackPage from './pages/MicrosoftCallbackPage';
import DashboardPage from './pages/DashboardPage';
import { FormType } from '@/types/FormType';
import { ReactNode } from 'react';
import { isAuthenticated } from "@/utils/authToken";

function ProtectedRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/auth/callback/microsoft" element={<MicrosoftCallbackPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route
          path="/form/:type/:templateId?"
          element={<ProtectedRoute><RetainerFormPage /></ProtectedRoute>}
        />
        <Route
          path="/preview/:type"
          element={<ProtectedRoute><PreviewRouter /></ProtectedRoute>}
        />
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
    case FormType.LitigationEngagement:
      return <LitigationEngagementPreviewPage />;
    case FormType.CustomTemplateGenerate:
      return <CustomTemplatePreviewPage />;
    default:
      return <div>Unknown preview type: {type}</div>;
  }
}
