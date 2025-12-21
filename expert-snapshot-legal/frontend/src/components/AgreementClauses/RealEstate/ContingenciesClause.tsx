// src/components/AgreementClauses/RealEstate/ContingenciesClause.tsx

type ContingenciesClauseProps = {
  inspectionContingency?: boolean;
  appraisalContingency?: boolean;
  financingContingency?: boolean;
  titleClearance?: boolean;
  renewalOptions?: string;
  disclosureAcknowledgment?: boolean;
};

export default function ContingenciesClause({
  inspectionContingency,
  appraisalContingency,
  financingContingency,
  titleClearance,
  renewalOptions,
  disclosureAcknowledgment,
}: ContingenciesClauseProps) {
  const clauses: string[] = [];

  if (inspectionContingency) {
    clauses.push('completion of a satisfactory property inspection');
  }
  if (appraisalContingency) {
    clauses.push('confirmation of a satisfactory appraisal');
  }
  if (financingContingency) {
    clauses.push('approval of financing by the Buyer');
  }
  if (titleClearance) {
    clauses.push('clearance of title to the property');
  }
  if (renewalOptions && renewalOptions !== 'None') {
    clauses.push(`the renewal option selected (${renewalOptions})`);
  }
  if (disclosureAcknowledgment) {
    clauses.push('acknowledgment of required disclosures');
  }

  const formatted =
    clauses.length === 1
      ? clauses[0]
      : clauses.length > 1
        ? clauses.slice(0, -1).join(', ') + ' and ' + clauses[clauses.length - 1]
        : '';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Contingencies</h3>
      {clauses.length > 0 ? (
        <p>This Agreement is contingent upon {formatted}.</p>
      ) : (
        <p>No contingencies or conditions are specified for this Agreement.</p>
      )}
    </section>
  );
}