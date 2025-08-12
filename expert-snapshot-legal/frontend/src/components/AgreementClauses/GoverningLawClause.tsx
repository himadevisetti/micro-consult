import styles from '../../styles/StandardPreview.module.css';

export default function GoverningLawClause({ jurisdiction }: { jurisdiction?: string }) {
  const resolvedJurisdiction = jurisdiction?.trim() || 'California';

  return (
    <section>
      <h3 className={styles.clauseHeading}>Governing Law</h3>
      <p>
        This Agreement shall be governed by and construed in accordance with the laws of{' '}
        <strong>{resolvedJurisdiction}</strong>, without regard to its conflicts of law principles.
      </p>
    </section>
  );
}
