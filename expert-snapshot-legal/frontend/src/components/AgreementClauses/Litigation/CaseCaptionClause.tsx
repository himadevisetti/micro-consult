// src/components/AgreementClauses/Litigation/CaseCaptionClause.tsx

type CaseCaptionClauseProps = {
  caseCaption?: string;
};

export default function CaseCaptionClause({ caseCaption }: CaseCaptionClauseProps) {
  const trimmedCaption = caseCaption?.trim();

  // Suppress clause entirely if caption is empty
  if (!trimmedCaption) return null;

  return (
    <section>
      <h3 style={{ fontWeight: "bold" }}>Case Caption</h3>
      <p>
        This engagement relates to the matter entitled <strong>{trimmedCaption}</strong>.
      </p>
    </section>
  );
}
