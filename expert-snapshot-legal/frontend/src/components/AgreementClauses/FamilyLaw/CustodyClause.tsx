// src/components/AgreementClauses/FamilyLaw/CustodyClause.tsx

type CustodyClauseProps = {
  custodyType?: string;
  childNames?: string[];
  childDOBs?: string[];
  decisionMakingAuthority?: string;
};

export default function CustodyClause({
  custodyType,
  childNames,
  childDOBs,
  decisionMakingAuthority,
}: CustodyClauseProps) {
  const resolvedCustody = custodyType?.trim() || 'Joint';
  const resolvedAuthority = decisionMakingAuthority?.trim() || 'Joint';
  const children = childNames?.length
    ? childNames.map((name, i) => `${name}${childDOBs?.[i] ? ` (DOB: ${childDOBs[i]})` : ''}`).join(', ')
    : 'the minor children';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Custody</h3>
      <p>
        Custody of {children} shall be <strong>{resolvedCustody}</strong>, with decision‑making
        authority vested in <strong>{resolvedAuthority}</strong>.
      </p>
    </section>
  );
}

