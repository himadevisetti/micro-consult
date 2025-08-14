import { jsx as _jsx } from "react/jsx-runtime";
// src/pages/StandardRetainerPreview.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StandardPreview from '../components/AgreementPreview/StandardPreview';
import { buildRetainerPreviewPayload } from '../utils/buildRetainerPreviewPayload';
export default function StandardRetainerPreview() {
    const location = useLocation();
    const navigate = useNavigate();
    const formData = location.state?.formData;
    useEffect(() => {
        if (!formData || Object.keys(formData).length === 0) {
            navigate('/builder', { replace: true });
        }
    }, [formData, navigate]);
    if (!formData || Object.keys(formData).length === 0) {
        return _jsx("p", { children: "\uD83D\uDD04 Redirecting to builder..." });
    }
    const payload = buildRetainerPreviewPayload(formData);
    const html = payload.clauses.map(c => `<p><strong>${c.id}:</strong> ${c.text}</p>`).join('');
    const onRefresh = () => {
        // Optional: trigger preview rebuild or re-navigation
        navigate('/builder');
    };
    return _jsx(StandardPreview, { html: html, onRefresh: onRefresh });
}
