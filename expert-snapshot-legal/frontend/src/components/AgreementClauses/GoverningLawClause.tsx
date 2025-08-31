// src/components/AgreementClauses/GoverningLawClause.tsx

type GoverningLawClauseProps = {
  jurisdiction?: string; // already normalized
};

export default function GoverningLawClause({ jurisdiction }: GoverningLawClauseProps) {
  const resolvedJurisdiction = jurisdiction?.trim() || 'California';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Governing Law</h3>
      <p>
        This Agreement shall be governed by and construed in accordance with the laws of{' '}
        <strong>{resolvedJurisdiction}</strong>, without regard to its conflicts of law principles.
      </p>
    </section>
  );
}
