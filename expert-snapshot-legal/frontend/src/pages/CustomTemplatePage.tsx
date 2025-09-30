// src/pages/CustomTemplatePage.tsx

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from '../styles/HomePage.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import RetainerCard from '../components/RetainerCard';

type TemplateInfo = { id: string; name: string };

const CustomTemplatePage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const customerId = 'customer-001';
    const timer = setTimeout(() => setShowSpinner(true), 200);

    fetch(`/api/templates/${customerId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch templates for ${customerId}`);
        return res.json();
      })
      .then((data) => setTemplates(data.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
        setShowSpinner(false);
      });

    return () => clearTimeout(timer);
  }, []);

  const handleUploadStart = () => {
    navigate(`/form/${FormType.CustomTemplateUpload}`);
  };

  const handleGenerateClick = () => {
    if (templates.length === 1) {
      navigate(`/form/${templates[0].id}`);
    } else if (templates.length > 1) {
      setShowModal(true);
    }
  };

  return (
    <div className={styles.landing}>
      <header className={styles.hero}>
        <p>
          Upload your base template once, then generate new documents with variable inputs.
        </p>
      </header>

      <section className={styles.templateOptions}>
        <div className={styles.cardGroup}>
          <h3>Get Started</h3>

          <div
            className={styles.retainerCardGrid}
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            <RetainerCard
              key="upload"
              title={RetainerTypeLabel[FormType.CustomTemplateUpload]}
              templateId={FormType.CustomTemplateUpload}
              iconSrc="upload-template"
              onStart={handleUploadStart}
              tooltip="Upload your base document and define the variables you’ll reuse."
              disabled={false}
            />

            {loading ? (
              showSpinner ? (
                <div className={styles.retainerCard}>
                  <div className={styles.spinner}></div>
                  <p>Checking for uploaded templates...</p>
                </div>
              ) : (
                <div className={styles.retainerCard}></div>
              )
            ) : (
              <RetainerCard
                key="generate"
                title={RetainerTypeLabel[FormType.CustomTemplateGenerate]}
                templateId={FormType.CustomTemplateGenerate}
                iconSrc="generate-document"
                onStart={handleGenerateClick}
                tooltip={
                  templates.length > 0
                    ? 'Use your uploaded template and fill in the variable fields to generate a document.'
                    : 'We couldn’t find your uploaded template. Please re‑upload to continue.'
                }
                disabled={templates.length === 0}
              />
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeading}>Select a template</h3>

            <div className={styles.modalBody}>
              <div
                className={styles.retainerCardGrid}
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {templates.map((tpl) => (
                  <RetainerCard
                    key={tpl.id}
                    title={tpl.name}
                    templateId={tpl.id as any}
                    iconSrc="generate-document"
                    onStart={() => navigate(`/form/${tpl.id}`)}
                    tooltip={`Generate a document using ${tpl.name}`}
                    disabled={false}
                  />
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTemplatePage;
