export default function CommunicationClause({ clientName }: { clientName?: string }) {
  const resolvedClient = clientName?.trim() || 'Client';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Communication Expectations</h3>
      <p>
        All substantive communications will be directed to <strong>{resolvedClient}</strong>. Email
        shall serve as the primary channel unless otherwise agreed upon.
      </p>
    </section>
  );
}
