// src/components/AgreementClauses/FamilyLaw/DivorceClause.tsx

type DivorceClauseProps = {
  marriageDate?: string;
  separationDate?: string;
  groundsForDivorce?: string;
};

export default function DivorceClause({
  marriageDate,
  separationDate,
  groundsForDivorce,
}: DivorceClauseProps) {
  const resolvedMarriageDate = marriageDate?.trim() || 'the date of marriage';
  const resolvedSeparationDate = separationDate?.trim() || 'the date of separation';
  const resolvedGrounds = groundsForDivorce?.trim() || 'irreconcilable differences';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Divorce</h3>
      <p>
        The Parties acknowledge that they were married on <strong>{resolvedMarriageDate}</strong> and
        separated on <strong>{resolvedSeparationDate}</strong>. The grounds for divorce are stated
        as <strong>{resolvedGrounds}</strong>.
      </p>
    </section>
  );
}

