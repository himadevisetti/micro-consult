// src/components/AgreementClauses/Startup/IPOwnershipClause.tsx

type IPOwnershipClauseProps = {
  ipOwnership?: string; // "Company", "Advisor", "Joint"
  companyName?: string;
  advisorName?: string;
};

function makePossessive(name: string) {
  const trimmed = name.trim();
  // If name ends with 's' or 'S', use just an apostrophe
  return /s$/i.test(trimmed) ? `${trimmed}'` : `${trimmed}'s`;
}

export default function IPOwnershipClause({
  ipOwnership,
  companyName = 'the Company',
  advisorName = 'the Advisor',
}: IPOwnershipClauseProps) {
  let resolvedOwnership: string;

  switch (ipOwnership?.trim()) {
    case 'Company':
      resolvedOwnership = companyName;
      break;
    case 'Advisor':
      resolvedOwnership = advisorName;
      break;
    case 'Joint':
      resolvedOwnership = `${companyName} and ${advisorName}`;
      break;
    default:
      resolvedOwnership = companyName;
  }

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Intellectual Property Ownership</h3>
      <p>
        All intellectual property, work product, and related materials created in connection with{' '}
        <strong>{makePossessive(advisorName)}</strong> services under this Agreement shall be owned by{' '}
        <strong>{resolvedOwnership}</strong>, unless otherwise agreed in writing by both parties.
      </p>
    </section>
  );
}
