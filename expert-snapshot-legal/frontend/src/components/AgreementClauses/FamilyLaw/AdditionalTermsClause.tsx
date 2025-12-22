// src/components/AgreementClauses/FamilyLaw/AdditionalTermsClause.tsx

type AdditionalTermsClauseProps = {
  additionalProvisions?: string;
};

export default function AdditionalTermsClause({
  additionalProvisions,
}: AdditionalTermsClauseProps) {
  const lines = (additionalProvisions ?? '').split(/\r?\n/);

  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return ''; // preserve blank lines

    // Keep bullet points as-is
    if (/^[-•]\s/.test(trimmed)) {
      return trimmed;
    }

    // Ensure punctuation at the end for non-bullets
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  });

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Additional Terms</h3>
      <p style={{ whiteSpace: 'pre-line' }}>{processedLines.join('\n')}</p>
    </section>
  );
}

