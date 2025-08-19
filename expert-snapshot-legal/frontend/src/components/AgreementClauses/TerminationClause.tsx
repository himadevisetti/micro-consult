export default function TerminationClause({
  endDate,
}: {
  endDate?: string;
}) {
  const resolvedEndDate = endDate?.trim() || 'the end date of this Agreement';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Termination</h3>
      <p>
        Either party may terminate this agreement with written notice. Client remains responsible
        for fees incurred through the date of termination. This agreement will automatically
        terminate on <strong>{resolvedEndDate}</strong> unless extended in writing.
      </p>
    </section>
  );
}
