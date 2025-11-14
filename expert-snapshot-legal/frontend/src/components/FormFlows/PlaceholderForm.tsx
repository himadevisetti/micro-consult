import React from 'react';
import { FormType, RetainerTypeLabel, getFormDomId } from '@/types/FormType';
import styles from '../../styles/StandardRetainerForm.module.css';

interface PlaceholderFormProps {
  formType: FormType;
}

export default function PlaceholderForm({ formType }: PlaceholderFormProps) {
  const formId = getFormDomId(formType);
  const label = RetainerTypeLabel[formType];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <form id={formId} className={styles.formInner}>
          <h2 className={styles.formTitle}>🧠 {label} Form</h2>

          <div className={styles.placeholderWrapper}>
            <p className={styles.placeholderMessage}>
              This flow is not yet implemented. Please check back later or contact support if you need this agreement urgently.
            </p>
          </div>

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitButton} disabled>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

