import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import FormRouterPage from './pages/FormRouterPage.js';
import StandardRetainerPreview from './pages/StandardRetainerPreview';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/builder", element: _jsx(FormRouterPage, {}) }), _jsx(Route, { path: "/preview", element: _jsx(StandardRetainerPreview, {}) })] }) }));
}
