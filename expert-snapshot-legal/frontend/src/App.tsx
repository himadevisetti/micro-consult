// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormRouterPage from './pages/FormRouterPage';
import StandardRetainerPreview from './pages/StandardRetainerPreview';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<FormRouterPage />} />
        <Route
          path="/standard-retainer/preview"
          element={<StandardRetainerPreview />}
        />
      </Routes>
    </BrowserRouter>
  );
}
