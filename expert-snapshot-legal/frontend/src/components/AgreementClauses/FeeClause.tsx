export default function FeeClause({
  structure,
  feeAmount,
  retainerAmount,
  jurisdiction,
}: {
  structure?: string;
  feeAmount?: string;
  retainerAmount?: string;
  jurisdiction?: string;
}) {
  const resolvedStructure = structure?.trim() || 'hourly';
  const resolvedFee = feeAmount?.trim() || '350';
  const resolvedRetainer = retainerAmount?.trim() || '1500';
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
