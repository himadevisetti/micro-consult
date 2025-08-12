import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import BuilderPage from './pages/BuilderPage.js';
import StandardPreview from './components/AgreementPreview/StandardPreview.js';
const mockFormData = {
    clientName: 'Acme Corp',
    legalGroup: 'Expert Snapshot Legal',
    startDate: '2025-09-01',
    retainerPurpose: 'IP Licensing',
    retainerType: 'Standard Legal Retainer',
    // Add other fields as needed for preview
};
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/builder", element: _jsx(BuilderPage, {}) }), _jsx(Route, { path: "/preview", element: _jsx("div", { style: { padding: '2rem' }, children: _jsx(StandardPreview, { formData: mockFormData }) }) })] }) }));
}
