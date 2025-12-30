// src/components/FormFlows/AgreementTypeSelector.tsx

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  stepperConfig,
  SELECTABLE_AGREEMENT_TYPES,
} from "../../config/familyLawAgreementStepperConfig";
import styles from "../../styles/StandardRetainerForm.module.css";

interface Props {
  onSelect: (fullTypes: string[], manualTypes: string[]) => Promise<void> | void;
  initialSelected?: string[];
}

// ------------------------------------------------------------
// Dependency graph using REAL step keys
// ------------------------------------------------------------
const DEPENDENCIES: Record<string, string[]> = {
  Custody: ["Divorce"],
  ChildSupport: ["Custody", "Divorce"],
  SpousalSupport: ["Divorce"],
  PropertySettlement: ["Divorce"],
};

// Reverse dependency graph (who depends on me?)
const REVERSE_DEPENDENCIES: Record<string, string[]> = {};
Object.entries(DEPENDENCIES).forEach(([child, parents]) => {
  parents.forEach((parent) => {
    if (!REVERSE_DEPENDENCIES[parent]) REVERSE_DEPENDENCIES[parent] = [];
    REVERSE_DEPENDENCIES[parent].push(child);
  });
});

// Canonical module order
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
  const [manualSelected, setManualSelected] = useState<string[]>(initialSelected);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();

  // ------------------------------------------------------------
  // Rehydrate using dependency-closure algorithm
  // ------------------------------------------------------------
  useEffect(() => {
    const state = location.state as any | undefined;
    const manual = state?.manualAgreementTypes as string[] | undefined;
    const full = state?.agreementTypes as string[] | undefined;

    //
    // 1. If parent passed manual selections, ALWAYS use them.
    //    This is the authoritative source of truth.
    //
    if (manual && manual.length > 0) {
      setManualSelected(manual);
      return;
    }

    //
    // 2. If no manual list but we have initialSelected, use that.
    //
    if (initialSelected && initialSelected.length > 0) {
      setManualSelected(initialSelected);
      return;
    }

    //
    // 3. If no manual list and no initialSelected, fallback to empty.
    //
    if (!full || full.length === 0) {
      setManualSelected([]);
      return;
    }

    //
    // 4. FINAL FALLBACK:
    //    If we only have the full list (rare), treat it as manual.
    //    This avoids misclassifying parents as auto-selected.
    //
    setManualSelected(full);
  }, [location.state, initialSelected]);

  // ------------------------------------------------------------
  // Apply dependencies
  // ------------------------------------------------------------
  const applyDependencies = (base: string[]): string[] => {
    const final = new Set(base);
    base.forEach((m) => {
      (DEPENDENCIES[m] || []).forEach((p) => final.add(p));
    });
    return Array.from(final);
  };

  const selectedWithDeps = applyDependencies(manualSelected);

  // ------------------------------------------------------------
  // Cascade deselect
  // ------------------------------------------------------------
  const cascadeDeselectManual = (base: string[]): string[] => {
    const final = new Set(base);
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
  // Toggle
  // ------------------------------------------------------------
  const toggleType = (stepKey: string) => {
    setManualSelected((prev) => {
      if (prev.includes(stepKey)) {
        let next = prev.filter((t) => t !== stepKey);
        next = cascadeDeselectManual(next);
        return next;
      }
      return [...prev, stepKey];
    });
  };

  // ------------------------------------------------------------
  // Sorting
  // ------------------------------------------------------------
  const sortModules = (mods: string[]) =>
    [...mods].sort(
      (a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b)
    );

  // ------------------------------------------------------------
  // Continue
  // ------------------------------------------------------------
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (selectedWithDeps.length === 0) return;

    const full = sortModules(selectedWithDeps);
    const manual = sortModules(manualSelected);

    setSubmitting(true);
    try {
      await onSelect(full, manual);
    } catch (err) {
      console.error("[AgreementTypeSelector] Continue failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Disable logic
  // ------------------------------------------------------------
  const isDisabled = (stepKey: string): boolean => {
    if (manualSelected.includes(stepKey)) return false;
    const dependents = REVERSE_DEPENDENCIES[stepKey] || [];
    return dependents.some((d) => manualSelected.includes(d));
  };

  const getTooltip = (stepKey: string): string => {
    const dependents = REVERSE_DEPENDENCIES[stepKey] || [];
    const active = dependents.filter((d) => manualSelected.includes(d));
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
            >
              {submitting ? (
                <span className={styles.spinnerWrapper}>
                  <span className={styles.spinner} /> Continuing…
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
