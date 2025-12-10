// src/components/AgreementClauses/Litigation/ScopeClause.tsx

type ScopeClauseProps = {
  scopeOfRepresentation?: string; // already normalized and trimmed
};

export default function ScopeClause({ scopeOfRepresentation }: ScopeClauseProps) {
  const rawScope = scopeOfRepresentation?.trim() || "representation in litigation matters";

  // Remove any trailing period before inserting into the sentence
  const resolvedScope = rawScope.replace(/\.*$/, "");

  return (
    <section>
      <h3 style={{ fontWeight: "bold" }}>Scope of Representation</h3>
      <p>
        The Attorney agrees to represent the Client in connection with{" "}
        <strong>{resolvedScope}</strong>. The scope includes professional services
        reasonably related to this litigation and excludes unrelated legal issues
        unless agreed upon in writing.
      </p>
    </section>
  );
}
