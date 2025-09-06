// src/components/AgreementClauses/Startup/NonCompeteClause.tsx

type NonCompeteClauseProps = {
  duration?: string; // e.g., "12 months"
};

export default function NonCompeteClause({ duration }: NonCompeteClauseProps) {
  const resolvedDuration = duration?.trim() || 'the agreed non‑compete period';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Non‑Compete</h3>
      <p>
        During the term of this Agreement and for <strong>{resolvedDuration}</strong> thereafter,
        the Advisor shall not engage, directly or indirectly, in any business or activity that
        competes with the Company’s business, without the Company’s prior written consent.
      </p>
    </section>
  );
}

