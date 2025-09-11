// src/components/AgreementClauses/Startup/TerminationClause.tsx

type StartupTerminationClauseProps = {
  effectiveDate?: string;              // formatted long date
  agreementDurationValue?: string;     // numeric string
  agreementDurationUnit?: string;      // e.g., "months", "years"
  companyName?: string;
  advisorName?: string;
  includeForCause?: boolean;           // 🆕 controls "for cause" language
};

export default function StartupTerminationClause({
  effectiveDate,
  agreementDurationValue,
  agreementDurationUnit,
  companyName = 'the Company',
  advisorName = 'the Advisor',
  includeForCause = false,
}: StartupTerminationClauseProps) {
  const numericDuration = Number(agreementDurationValue);
  const hasDuration = !isNaN(numericDuration) && numericDuration > 0;
  const durationText = hasDuration
    ? `${numericDuration} ${agreementDurationUnit || ''}`.trim()
    : '';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Termination</h3>
      <p>
        This Agreement may be terminated by either party
        {includeForCause
          ? <> for cause (including, but not limited to, material breach, misconduct, or failure to perform duties) or with written notice</>
          : <> with written notice</>}.
        {' '}
        <strong>{companyName}</strong> remains responsible for any obligations or fees incurred through the date of termination.{' '}
        This Agreement will remain in effect
        {hasDuration ? (
          <> for <strong>{durationText}</strong> from <strong>{effectiveDate || 'the effective date'}</strong></>
        ) : effectiveDate ? (
          <> from <strong>{effectiveDate}</strong></>
        ) : (
          ''
        )} unless extended in writing by both parties.
      </p>
    </section>
  );
}
