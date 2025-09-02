// src/App.tsx

import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RetainerFormPage from './pages/RetainerFormPage';
import RetainerPreviewPage from './pages/RetainerPreviewPage';
import IPRightsLicensingPreviewPage from './pages/IPRightsLicensingPreviewPage';
import { FormType } from '@/types/FormType';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form/:type" element={<RetainerFormPage />} />
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
    default:
      return <div>Unknown preview type: {type}</div>;
  }
}
