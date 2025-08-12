import styles from '../../styles/StandardPreview.module.css';

export default function CostsClause() {
  return (
    <section>
      <h3 className={styles.clauseHeading}>Costs & Expenses</h3>
      <p>
        The Client shall be responsible for expenses incurred during representation, including but
        not limited to filing fees, courier charges, and travel costs.
      </p>
    </section>
  );
}
