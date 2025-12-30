// src/components/FormFlows/AgreementTypeSelector.tsx

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  stepperConfig,
  SELECTABLE_AGREEMENT_TYPES,
} from "../../config/familyLawAgreementStepperConfig";
import styles from "../../styles/StandardRetainerForm.module.css";

interface Props {
  onSelect: (types: string[]) => Promise<void> | void;
  initialSelected?: string[];
}

// ------------------------------------------------------------
// ⭐ Correct dependency graph using REAL step keys
// ------------------------------------------------------------
const DEPENDENCIES: Record<string, string[]> = {
  Custody: ["Divorce"],
  ChildSupport: ["Custody", "Divorce"],
  SpousalSupport: ["Divorce"],
  PropertySettlement: ["Divorce"],
};

// ------------------------------------------------------------
// ⭐ Reverse dependency graph (who depends on me?)
// ------------------------------------------------------------
const REVERSE_DEPENDENCIES: Record<string, string[]> = {};
Object.entries(DEPENDENCIES).forEach(([child, parents]) => {
  parents.forEach((parent) => {
    if (!REVERSE_DEPENDENCIES[parent]) REVERSE_DEPENDENCIES[parent] = [];
    REVERSE_DEPENDENCIES[parent].push(child);
  });
});

// ------------------------------------------------------------
// ⭐ Canonical module order
// ------------------------------------------------------------
const CANONICAL_ORDER = [
  "Divorce",
  "Custody",
  "ChildSupport",
  "SpousalSupport",
  "PropertySettlement",
];

// Map stepKey -> title for tooltips
const STEP_KEY_TO_TITLE: Record<string, string> = {};
SELECTABLE_AGREEMENT_TYPES.forEach((typeKey) => {
  const cfg = stepperConfig[typeKey];
  STEP_KEY_TO_TITLE[cfg.key] = cfg.title;
});

export default function AgreementTypeSelector({
  onSelect,
  initialSelected = [],
}: Props) {
  // ⭐ What the user explicitly selected (no auto-parents here)
  const [manualSelected, setManualSelected] = useState<string[]>(initialSelected);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();

  // ------------------------------------------------------------
  // ⭐ Rehydrate from navigation state (fixes Divorce staying checked)
  // ------------------------------------------------------------
  useEffect(() => {
    const stateTypes = (location.state as any)?.agreementTypes as
      | string[]
      | undefined;

    if (stateTypes && stateTypes.length > 0) {
      // Remove auto-selected parents from rehydrated list
      const cleaned = stateTypes.filter((stepKey) => {
        const isParent = REVERSE_DEPENDENCIES[stepKey] !== undefined;

        if (isParent) {
          const requiredByChild = (REVERSE_DEPENDENCIES[stepKey] || []).some(
            (child) => stateTypes.includes(child)
          );
          if (requiredByChild) {
            return false; // drop auto-selected parent
          }
        }

        return true; // keep manual selection
      });

      setManualSelected(cleaned);
    }
  }, [location.state]);

  // Sync with initialSelected prop
  useEffect(() => {
    if (initialSelected && initialSelected.length > 0) {
      setManualSelected(initialSelected);
    }
  }, [initialSelected]);

  // ------------------------------------------------------------
  // ⭐ Auto-select parents for all manually selected modules
  // ------------------------------------------------------------
  const applyDependencies = (baseSelected: string[]): string[] => {
    const final = new Set(baseSelected);

    baseSelected.forEach((stepKey) => {
      const parents = DEPENDENCIES[stepKey] || [];
      parents.forEach((parent) => final.add(parent));
    });

    return Array.from(final);
  };

  // ------------------------------------------------------------
  // ⭐ When a parent is removed, remove dependent children
  //    from the *manual* selection
  // ------------------------------------------------------------
  const cascadeDeselectManual = (baseSelected: string[]): string[] => {
    const final = new Set(baseSelected);

    let changed = true;
    while (changed) {
      changed = false;

      Object.entries(REVERSE_DEPENDENCIES).forEach(([parent, children]) => {
        if (!final.has(parent)) {
          children.forEach((child) => {
            if (final.has(child)) {
              final.delete(child);
              changed = true;
            }
          });
        }
      });
    }

    return Array.from(final);
  };

  // ------------------------------------------------------------
  // ⭐ Derived selection = manual + required parents
  // ------------------------------------------------------------
  const selectedWithDeps = applyDependencies(manualSelected);

  // ------------------------------------------------------------
  // ⭐ Toggle logic
  // ------------------------------------------------------------
  const toggleType = (stepKey: string) => {
    setManualSelected((prev) => {
      // UNCHECKING
      if (prev.includes(stepKey)) {
        let nextManual = prev.filter((t) => t !== stepKey);
        nextManual = cascadeDeselectManual(nextManual);
        return nextManual;
      }

      // CHECKING
      return [...prev, stepKey];
    });
  };

  // ------------------------------------------------------------
  // ⭐ Sort modules into canonical order
  // ------------------------------------------------------------
  const sortModules = (modules: string[]): string[] => {
    return [...modules].sort(
      (a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b)
    );
  };

  // ------------------------------------------------------------
  // Continue button handler
  // ------------------------------------------------------------
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (selectedWithDeps.length === 0) return;

    const sorted = sortModules(selectedWithDeps);

    setSubmitting(true);
    try {
      await onSelect(sorted);
    } catch (err) {
      console.error("[AgreementTypeSelector] Continue failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Focus first checkbox on error
  useEffect(() => {
    if (submitted && selectedWithDeps.length === 0) {
      const firstCheckbox = document.querySelector<HTMLInputElement>(
        "#family-law-agreement-selector input[type='checkbox']"
      );
      firstCheckbox?.focus();
      setSubmitted(false);
    }
  }, [submitted, selectedWithDeps]);

  const renderButtonLabel = () =>
    submitting ? (
      <span className={styles.spinnerWrapper}>
        <span className={styles.spinner} /> Continuing…
      </span>
    ) : (
      "Continue"
    );

  // ------------------------------------------------------------
  // ⭐ Disable parents required by any *manually* selected module
  // ------------------------------------------------------------
  const isDisabled = (stepKey: string): boolean => {
    const dependents = REVERSE_DEPENDENCIES[stepKey] || [];
    return dependents.some((dep) => manualSelected.includes(dep));
  };

  const getTooltip = (stepKey: string): string => {
    const dependents = REVERSE_DEPENDENCIES[stepKey] || [];
    const active = dependents.filter((dep) => manualSelected.includes(dep));
    if (active.length === 0) return "";

    return `Required for: ${active.map((d) => STEP_KEY_TO_TITLE[d]).join(", ")}`;
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form
          id="family-law-agreement-selector"
          className={styles.formInner}
          onSubmit={handleContinue}
        >
          {submitted && selectedWithDeps.length === 0 && (
            <div className={styles.errorBanner}>
              Please select at least one module to continue.
            </div>
          )}

          <h2 className={styles.formTitle}>📑 Select Agreement Types</h2>
          <p className={styles.formSubtitle}>
            Please choose one or more modules to include in this agreement.
          </p>

          <div className={styles.selectorGroup}>
            {SELECTABLE_AGREEMENT_TYPES.map((typeKey) => {
              const stepKey = stepperConfig[typeKey].key;
              const disabled = isDisabled(stepKey);
              const tooltip = getTooltip(stepKey);

              return (
                <div key={stepKey} className={styles.selectorRow}>
                  <label className={styles.label} title={tooltip}>
                    <input
                      type="checkbox"
                      checked={selectedWithDeps.includes(stepKey)}
                      disabled={disabled}
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
              disabled={submitting || selectedWithDeps.length === 0}
              title={
                selectedWithDeps.length === 0
                  ? "Please select at least one module to continue."
                  : ""
              }
            >
              {renderButtonLabel()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
