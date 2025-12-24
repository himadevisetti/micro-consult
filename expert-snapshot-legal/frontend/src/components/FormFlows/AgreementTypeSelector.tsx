// src/components/FormFlows/AgreementTypeSelector.tsx

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { stepperConfig, SELECTABLE_AGREEMENT_TYPES } from "../../config/familyLawAgreementStepperConfig";
import styles from "../../styles/StandardRetainerForm.module.css";

interface Props {
  onSelect: (types: string[]) => Promise<void> | void;
  initialSelected?: string[];
}

export default function AgreementTypeSelector({ onSelect, initialSelected = [] }: Props) {
  // ✅ selected holds canonical step keys (e.g. "Custody", "Divorce")
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();

  // ✅ Hydrate selections from navigation state when returning from stepper
  useEffect(() => {
    const stateTypes = (location.state as any)?.agreementTypes as string[] | undefined;
    if (stateTypes && stateTypes.length > 0) {
      setSelected(stateTypes);
    }
  }, [location.state]);

  // ✅ Keep selected in sync if initialSelected prop changes
  useEffect(() => {
    if (initialSelected && initialSelected.length > 0) {
      setSelected(initialSelected);
    }
  }, [initialSelected]);

  // ✅ Toggle a module on/off by its step key
  const toggleType = (stepKey: string) => {
    setSelected(prev =>
      prev.includes(stepKey) ? prev.filter(t => t !== stepKey) : [...prev, stepKey]
    );
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (selected.length === 0) return;

    setSubmitting(true);
    try {
      // ✅ Pass canonical step keys to parent
      await onSelect(selected);
    } catch (err) {
      console.error("[AgreementTypeSelector] Continue failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted && selected.length === 0) {
      const firstCheckbox = document.querySelector<HTMLInputElement>(
        "#family-law-agreement-selector input[type='checkbox']"
      );
      firstCheckbox?.focus();
      setSubmitted(false);
    }
  }, [submitted, selected]);

  const renderButtonLabel = () =>
    submitting ? (
      <span className={styles.spinnerWrapper}>
        <span className={styles.spinner} /> Continuing…
      </span>
    ) : (
      "Continue"
    );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form
          id="family-law-agreement-selector"
          className={styles.formInner}
          onSubmit={handleContinue}
        >
          {submitted && selected.length === 0 && (
            <div className={styles.errorBanner}>
              Please select at least one module to continue.
            </div>
          )}

          <h2 className={styles.formTitle}>📑 Select Agreement Types</h2>
          <p className={styles.formSubtitle}>
            Please choose one or more modules to include in this agreement.
          </p>

          <div className={styles.selectorGroup}>
            {SELECTABLE_AGREEMENT_TYPES.map(typeKey => {
              const stepKey = stepperConfig[typeKey].key; // ✅ canonical key
              return (
                <div key={stepKey} className={styles.selectorRow}>
                  <label className={styles.label}>
                    <input
                      type="checkbox"
                      checked={selected.includes(stepKey)}
                      onChange={() => toggleType(stepKey)}
                      className={styles.checkboxInput}
                    />
                    <span>{stepperConfig[typeKey].title}</span>
                  </label>
                </div>
              );
            })}
          </div>

          <div className={styles.submitRow}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || selected.length === 0}
              title={selected.length === 0 ? "Please select at least one module to continue." : ""}
            >
              {renderButtonLabel()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
