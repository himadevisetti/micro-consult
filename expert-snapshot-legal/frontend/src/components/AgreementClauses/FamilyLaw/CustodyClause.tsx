// src/components/AgreementClauses/FamilyLaw/CustodyClause.tsx

import type { ChildEntry } from '@/types/FamilyLawAgreementFormData';

type CustodyClauseProps = {
  custodyType?: string;
  children?: ChildEntry[];
  decisionMakingAuthority?: string;
};

export default function CustodyClause({
  custodyType,
  children,
  decisionMakingAuthority,
}: CustodyClauseProps) {
  const resolvedCustody = custodyType?.trim() || 'Joint';
  const resolvedAuthority = decisionMakingAuthority?.trim() || 'Joint';

  const childrenText =
    children && children.length > 0
      ? children
        .map(
          (child) =>
            `${child.name}${child.dob ? ` (DOB: ${child.dob})` : ''}`
        )
        .join(', ')
      : 'the minor children';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Custody</h3>
      <p>
        Custody of {childrenText} shall be <strong>{resolvedCustody}</strong>, with
        decision‑making authority vested in <strong>{resolvedAuthority}</strong>.
      </p>
    </section>
  );
}
