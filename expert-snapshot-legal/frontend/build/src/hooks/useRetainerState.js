import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateRetainerForm } from '../utils/validateRetainerForm';
import { buildRetainerPreviewPayload } from '../utils/buildRetainerPreviewPayload';
import { getSerializedClauses } from '../utils/serializeClauses';
import { useSessionFormState } from './useSessionFormState';
import { defaultRetainerFormData } from '../types/RetainerFormData';
export function useRetainerState() {
    const [formData, setFormData] = useSessionFormState('standardRetainerForm', defaultRetainerFormData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [previewHtml, setPreviewHtml] = useState('');
    const [metadata, setMetadata] = useState({});
    const navigate = useNavigate();
    const validate = () => {
        const result = validateRetainerForm(formData);
        setErrors(result);
        return Object.keys(result).length === 0;
    };
    const markTouched = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const generatePreview = async () => {
        const isValid = validate();
        if (!isValid)
            return '';
        const payload = buildRetainerPreviewPayload(formData);
        setMetadata(payload.metadata);
        const clauseHtmlMap = getSerializedClauses(formData);
        const html = `
      <div style="margin-top:60px;">
        <h2 style="text-align:center; font-weight:bold;">STANDARD RETAINER AGREEMENT</h2>
      </div>
      ${Object.values(clauseHtmlMap).join('\n')}`;
        setPreviewHtml(html);
        console.log('Preview HTML:', html);
        return html;
    };
    const handleSubmit = async () => {
        const isValid = validate();
        if (!isValid) {
            console.warn('Form submission blocked due to validation errors:', errors);
            return;
        }
        const html = await generatePreview();
        console.log('Form submitted successfully:', formData);
        navigate('/preview', {
            state: {
                formData,
                previewHtml: html,
                metadata,
            },
        });
    };
    return {
        formData,
        errors,
        touched,
        updateField,
        markTouched,
        validate,
        generatePreview,
        handleSubmit,
        previewHtml,
        metadata,
    };
}
