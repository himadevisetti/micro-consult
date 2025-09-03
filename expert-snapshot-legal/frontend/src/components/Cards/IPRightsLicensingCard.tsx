import React from 'react';
import styles from '@/styles/RetainerCard.module.css';

export default function IPRightsLicensingCard() {
  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>IPR&amp;L Component Flow</h3>
      </header>

      <div className={styles.cardBody}>
        {/* Types & Config */}
        <h4 className={styles.sectionHeader}>Types &amp; Config</h4>
        <ul className={styles.flowList}>
          <li>src/types/IPRightsLicensingFormData.ts</li>
          <li>src/types/IPRetainerFieldConfig.ts</li>
          <li>src/types/ipRightsLicensingSchema.ts</li>
        </ul>

        <div className={styles.arrow}>↓</div>

        {/* Form Flow */}
        <h4 className={styles.sectionHeader}>Form Flow</h4>
        <ul className={styles.flowList}>
          <li>src/pages/RetainerFormPage.tsx</li>
          <li>src/components/FormFlows/IPRightsLicensingForm.tsx</li>
          <li>src/utils/parseAndValidateIPForm.ts</li>
          <li>src/utils/normalizeIPFormData.ts</li>
        </ul>

        <div className={styles.arrow}>↓</div>

        {/* Clauses */}
        <h4 className={styles.sectionHeader}>Clauses</h4>
        <ul className={styles.flowList}>
          <li>src/components/AgreementClauses/IPClauses.tsx</li>
          <li>src/components/AgreementClauses/IP/SignatureClause.tsx</li>
          <li>src/utils/serializeIPClauses.tsx</li>
        </ul>

        <div className={styles.arrow}>↓</div>

        {/* Preview */}
        <h4 className={styles.sectionHeader}>Preview</h4>
        <ul className={styles.flowList}>
          <li>src/utils/buildIPPreviewPayload.ts</li>
          <li>src/pages/IPRightsLicensingPreviewPage.tsx</li>
          <li>src/components/Previews/IPPreview.tsx</li>
        </ul>

        <div className={styles.arrow}>↓</div>

        {/* Card Rendering */}
        <h4 className={styles.sectionHeader}>Card Rendering</h4>
        <ul className={styles.flowList}>
          <li>src/flows/IPRightsLicensingFlow.tsx</li>
          <li>src/pages/HomePage.tsx</li>
          <li>src/components/RetainerCard.tsx</li>
        </ul>
      </div>
    </div>
  );
}

