import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import homeStyles from '../styles/HomePage.module.css';
import formStyles from '../styles/StandardRetainerForm.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import RetainerCard from '../components/RetainerCard';

type TemplateInfo = {
  id: string;
  name: string;
  hasManifest: boolean;
};

const CustomTemplatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ consume success flag once and clear it
  useEffect(() => {
    if (location.state?.success) {
      setShowSuccess(true);
      // clear the state so it doesn't persist on future navigations
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ auto-dismiss after 10s
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

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
    const readyTemplates = templates.filter((t) => t.hasManifest);

    if (readyTemplates.length === 1) {
      navigate(`/form/${readyTemplates[0].id}`);
    } else if (readyTemplates.length > 1) {
      setShowModal(true);
    }
  };

  return (
    <div className={homeStyles.landing}>
      <header className={homeStyles.hero}>
        <p>
          Upload your base template once, then generate new documents with variable inputs.
        </p>
      </header>

      <section className={homeStyles.templateOptions}>
        <div className={homeStyles.cardGroup}>
          <h3>Get Started</h3>

          <div
            className={homeStyles.retainerCardGrid}
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
                <div className={homeStyles.retainerCard}>
                  <div className={homeStyles.spinner}></div>
                  <p>Checking for uploaded templates...</p>
                </div>
              ) : (
                <div className={homeStyles.retainerCard}></div>
              )
            ) : (
              <RetainerCard
                key="generate"
                title={RetainerTypeLabel[FormType.CustomTemplateGenerate]}
                templateId={FormType.CustomTemplateGenerate}
                iconSrc="generate-document"
                onStart={handleGenerateClick}
                tooltip={
                  templates.some((t) => t.hasManifest)
                    ? 'Use your uploaded template and fill in the variable fields to generate a document.'
                    : 'We couldn’t find a ready template (with manifest). Please upload and confirm mapping first.'
                }
                disabled={!templates.some((t) => t.hasManifest)}
              />
            )}
          </div>
        </div>
      </section>

      {/* ✅ Success banner below the section, using formStyles */}
      <div
        className={`${formStyles.successBanner} ${showSuccess ? formStyles.show : formStyles.hide
          }`}
      >
        <span>
          ✅ Template mapping saved successfully. You can now generate documents.
        </span>
        <button
          type="button"
          className={formStyles.closeButton}
          onClick={() => setShowSuccess(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {showModal && (
        <div className={homeStyles.modalBackdrop}>
          <div className={homeStyles.modalContent}>
            <h3 className={homeStyles.modalHeading}>Select a template</h3>

            <div className={homeStyles.modalBody}>
              <div
                className={homeStyles.retainerCardGrid}
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {templates
                  .filter((tpl) => tpl.hasManifest)
                  .map((tpl) => (
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

            <div className={homeStyles.modalFooter}>
              <button
                className={homeStyles.cancelButton}
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
