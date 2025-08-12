// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import BuilderPage from './pages/BuilderPage.js';
import StandardPreview from './components/AgreementPreview/StandardPreview.js';

const mockFormData: Record<string, string> = {
  clientName: 'Acme Corp',
  legalGroup: 'Expert Snapshot Legal',
  startDate: '2025-09-01',
  retainerPurpose: 'IP Licensing',
  retainerType: 'Standard Legal Retainer',
  // Add other fields as needed for preview
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route
          path="/preview"
          element={
            <div style={{ padding: '2rem' }}>
              <StandardPreview formData={mockFormData} />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
