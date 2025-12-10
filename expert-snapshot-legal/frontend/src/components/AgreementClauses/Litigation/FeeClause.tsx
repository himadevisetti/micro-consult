// src/components/AgreementClauses/Litigation/FeeClause.tsx

type FeeClauseProps = {
  structure?: string;
  feeAmount?: string;       // already formatted, e.g. "350.00"
  retainerAmount?: string;  // already formatted, e.g. "1500.00"
  jurisdiction?: string;
};

export default function FeeClause({
  structure,
  feeAmount,
  retainerAmount,
  jurisdiction,
}: FeeClauseProps) {
  const resolvedStructure = structure?.trim() || 'hourly';
  const resolvedFee = feeAmount?.trim() || '350.00';
  const resolvedRetainer = retainerAmount?.trim() || '1500.00';
  const resolvedJurisdiction = jurisdiction?.trim() || 'California';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Fees, Costs & Retainer</h3>
      <p>
        Legal fees shall be billed under a <strong>{resolvedStructure}</strong> model
        at a rate of <strong>${resolvedFee}/hour</strong>. An initial retainer of{' '}
        <strong>${resolvedRetainer}</strong> is due upon execution. The Client is
        also responsible for court costs, filing fees, and other litigation expenses,
        in accordance with the laws of <strong>{resolvedJurisdiction}</strong>.
      </p>
    </section>
  );
}

