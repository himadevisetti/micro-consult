// src/utils/SubmitButton.tsx
import React from "react";
import styles from "../styles/StandardRetainerForm.module.css";

interface SubmitButtonProps {
  submitting: boolean;
  label?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ submitting, label = "Submit" }) => {
  return (
    <button type="submit" className={styles.submitButton} disabled={submitting}>
      {submitting ? (
        <span className={styles.spinnerWrapper}>
          <span className={styles.spinner} />
          <span>{label}ing…</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
};

export default SubmitButton;

