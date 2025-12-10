// src/components/AgreementClauses/Litigation/CourtClause.tsx

type CourtClauseProps = {
  courtName?: string;
  courtAddress?: string;
};

export default function CourtClause({ courtName, courtAddress }: CourtClauseProps) {
  const trimmedCourt = courtName?.trim();
  const trimmedAddress = courtAddress?.trim();

  // Suppress clause entirely if neither court name nor address is provided
  if (!trimmedCourt && !trimmedAddress) return null;

  return (
    <section>
      <h3 style={{ fontWeight: "bold" }}>Court</h3>
      <p>
        Proceedings shall be conducted
        {trimmedCourt && (
          <> before <strong>{trimmedCourt}</strong></>
        )}
        {trimmedAddress && (
          <>
            {trimmedCourt ? ", located at " : " at "}
            <strong>{trimmedAddress}</strong>
          </>
        )}
        .
      </p>
    </section>
  );
}
