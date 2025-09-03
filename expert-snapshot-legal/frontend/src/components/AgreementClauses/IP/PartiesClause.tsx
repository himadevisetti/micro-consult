type PartiesClauseProps = {
  clientName?: string;
  providerName?: string;
  inventorName?: string;
  effectiveDate?: string;
};

export default function PartiesClause({
  clientName,
  providerName,
  inventorName,
  effectiveDate,
}: PartiesClauseProps) {
  const resolvedClient = clientName?.trim() || 'the Client';
  const resolvedProvider = providerName?.trim() || 'the IP Counsel';
  const resolvedInventor = inventorName?.trim() || 'the Inventor';
  const resolvedDate = effectiveDate?.trim() || 'the effective date of this Agreement';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Agreement is entered into between <strong>{resolvedClient}</strong> and{' '}
        <strong>{resolvedProvider}</strong>, concerning intellectual property created by{' '}
        <strong>{resolvedInventor}</strong> effective as of <strong>{resolvedDate}</strong>.
      </p>
    </section>
  );
}

