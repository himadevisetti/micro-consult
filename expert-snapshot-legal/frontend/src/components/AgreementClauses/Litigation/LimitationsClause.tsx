// src/components/AgreementClauses/Litigation/LimitationsClause.tsx

type LimitationsClauseProps = {
  limitations?: string;
};

export default function LimitationsClause({ limitations }: LimitationsClauseProps) {
  const rawLimitations = limitations?.trim() || "No specific limitations have been agreed upon.";

  // Remove a single trailing period if present
  const resolvedLimitations = rawLimitations.replace(/\.$/, "");

  return (
    <section>
      <h3 style={{ fontWeight: "bold" }}>Limitations of Representation</h3>
      <p>
        The representation is subject to the following limitations:{" "}
        <strong>{resolvedLimitations}</strong>.
      </p>
    </section>
  );
}
