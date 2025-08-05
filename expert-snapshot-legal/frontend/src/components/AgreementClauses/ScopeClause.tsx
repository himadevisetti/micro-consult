export default function ScopeClause({ retainerPurpose }: { retainerPurpose?: string }) {
  const resolvedPurpose = retainerPurpose?.trim() || 'general legal services';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Scope of Representation</h3>
      <p>
        The Attorney agrees to represent the Client in connection with{' '}
        <strong>{resolvedPurpose}</strong>. The scope includes professional services reasonably
        related to this purpose and excludes unrelated legal issues unless agreed upon in writing.
      </p>
    </section>
  );
}
