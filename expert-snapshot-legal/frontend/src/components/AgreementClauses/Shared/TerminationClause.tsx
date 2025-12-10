// src/components/AgreementClauses/Shared/TerminationClause.tsx

type TerminationClauseProps = {
  endDate?: string;              // already formatted, e.g. "August 30, 2025"
  responsibleParty?: string;     // e.g., "the Client", "the Company", or a dynamic name
  clientTerminationRights?: boolean; // toggle from formData
};

export default function TerminationClause({
  endDate,
  responsibleParty,
  clientTerminationRights,
}: TerminationClauseProps) {
  const resolvedResponsibleParty =
    responsibleParty && responsibleParty.trim().length > 0
      ? responsibleParty.trim()
      : "the responsible party";

  // Capitalize if it's the start of a sentence
  const capitalizedResponsibleParty =
    resolvedResponsibleParty.charAt(0).toUpperCase() + resolvedResponsibleParty.slice(1);

  return (
    <section>
      <h3 style={{ fontWeight: "bold" }}>Termination</h3>
      <p>
        {clientTerminationRights
          ? `${capitalizedResponsibleParty} may terminate this Agreement with written notice.`
          : `Either party may terminate this Agreement with written notice.`}{" "}
        Obligations and fees incurred through the date of termination remain enforceable.
        {endDate && (
          <> This Agreement will automatically terminate on <strong>{endDate}</strong> unless extended in writing by both parties.</>
        )}
      </p>
    </section>
  );
}
