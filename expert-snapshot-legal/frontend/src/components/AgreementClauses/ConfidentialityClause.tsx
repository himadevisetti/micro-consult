import styles from '../../styles/StandardPreview.module.css';

export default function ConfidentialityClause() {
  return (
    <section>
      <h3 className={styles.clauseHeading}>Confidentiality & Privilege</h3>
      <p>
        All communications and materials shall remain confidential and protected under applicable
        attorney-client privilege laws.
      </p>
    </section>
  );
}
