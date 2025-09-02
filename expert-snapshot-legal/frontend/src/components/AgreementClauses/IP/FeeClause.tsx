type FeeClauseProps = {
  structure?: string;
  feeAmount?: string;
  retainerAmount?: string;
  jurisdiction?: string;
};

export default function FeeClause({
  structure,
  feeAmount,
  retainerAmount,
  jurisdiction,
}: FeeClauseProps) {
  const resolvedStructure = structure?.trim() || 'flat';
  const resolvedFee = feeAmount?.trim() || '0.00';
  const resolvedRetainer = retainerAmount?.trim() || '0.00';
  const resolvedJurisdiction = jurisdiction?.trim() || 'California';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Fees & Engagement Terms</h3>
      <p>
        Legal services related to intellectual property shall be billed under a{' '}
        <strong>{resolvedStructure}</strong> arrangement. The agreed fee is{' '}
        <strong>${resolvedFee}</strong>, with an initial retainer of{' '}
        <strong>${resolvedRetainer}</strong>. All billing and refund policies shall comply with the
        laws of <strong>{resolvedJurisdiction}</strong>.
      </p>
    </section>
  );
}

