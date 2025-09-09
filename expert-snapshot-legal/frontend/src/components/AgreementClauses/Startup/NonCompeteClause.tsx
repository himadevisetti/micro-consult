// src/components/AgreementClauses/Startup/NonCompeteClause.tsx

type NonCompeteClauseProps = {
  durationValue?: string; // numeric string
  durationUnit?: string;  // e.g., "days", "weeks", "months", "years"
  advisorName?: string;
  companyName?: string;
};

export default function NonCompeteClause({
  durationValue,
  durationUnit,
  advisorName = 'the Advisor',
  companyName = 'the Company',
}: NonCompeteClauseProps) {
  const numericValue = Number(durationValue);
  const hasDuration = !isNaN(numericValue) && numericValue > 0;
  const durationText = hasDuration
    ? `${numericValue} ${durationUnit || ''}`.trim()
    : '';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Non‑Compete</h3>
      <p>
        During the term of this Agreement
        {hasDuration && ` and for ${durationText} thereafter`},{' '}
        <strong>{advisorName}</strong> shall not engage, directly or indirectly, in any business or
        activity that competes with <strong>{companyName}</strong>’s business, without{' '}
        <strong>{companyName}</strong>’s prior written consent.
      </p>
    </section>
  );
}
