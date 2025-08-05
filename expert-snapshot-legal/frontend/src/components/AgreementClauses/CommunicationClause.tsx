export default function CommunicationClause({ contactPerson }: { contactPerson?: string }) {
  const resolvedContact = contactPerson?.trim() || 'the Client';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Communication Expectations</h3>
      <p>
        All substantive communications will be directed to <strong>{resolvedContact}</strong>. Email
        shall serve as the primary channel unless otherwise agreed upon.
      </p>
    </section>
  );
}
