// src/components/AgreementClauses/Shared/TerminationClause.tsx

type TerminationClauseProps = {
  endDate?: string; // already formatted, e.g. "August 30, 2025"
  responsibleParty?: string; // e.g., "the Client", "the Company", or a dynamic name
  noticePeriod?: string; // e.g., "30 days"
  includeTerminationForCause?: boolean;
};

export default function TerminationClause({
  endDate,
  responsibleParty,
  noticePeriod,
  includeTerminationForCause,
}: TerminationClauseProps) {
  const resolvedEndDate = endDate?.trim() || 'the end date of this Agreement';
  const resolvedResponsibleParty =
    responsibleParty && responsibleParty.trim().length > 0
      ? responsibleParty.trim()
      : 'the responsible party';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Termination</h3>
      <p>
        Either party may terminate this Agreement
        {noticePeriod ? ` by providing ${noticePeriod} written notice` : ' with written notice'}.
        {includeTerminationForCause &&
          ' Either party may also terminate this Agreement immediately for cause, including material breach or misconduct.'}{' '}
        {resolvedResponsibleParty} remains responsible for any obligations or fees incurred through
        the date of termination. This Agreement will automatically terminate on{' '}
        <strong>{resolvedEndDate}</strong> unless extended in writing by both parties.
      </p>
    </section>
  );
}
