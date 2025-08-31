// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RetainerFormPage from './pages/RetainerFormPage';
import RetainerPreviewPage from './pages/RetainerPreviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form/:type" element={<RetainerFormPage />} />
        <Route path="/preview/:type" element={<RetainerPreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
