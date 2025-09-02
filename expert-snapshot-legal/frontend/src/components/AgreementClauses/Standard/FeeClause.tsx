// src/components/AgreementClauses/Standard/FeeClause.tsx

type FeeClauseProps = {
  structure?: string;
  feeAmount?: string;         // already formatted, e.g. "350.00"
  retainerAmount?: string;    // already formatted, e.g. "1500.00"
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
      <h3 style={{ fontWeight: 'bold' }}>Fee Structure & Retainer</h3>
      <p>
        Fees shall be billed under a <strong>{resolvedStructure}</strong> model at a rate of
        <strong> ${resolvedFee}/hour</strong>. An initial retainer of{' '}
        <strong>${resolvedRetainer}</strong> is due upon execution. Refunds, if any, shall comply
        with the laws of <strong>{resolvedJurisdiction}</strong>.
      </p>
    </section>
  );
}
