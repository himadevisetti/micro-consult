// src/components/AgreementClauses/RealEstate/EscrowClause.tsx

type EscrowClauseProps = {
  escrowAgencyName?: string;
  closingCostsResponsibility?: 'Buyer' | 'Seller' | 'Split';
};

export default function EscrowClause({
  escrowAgencyName,
  closingCostsResponsibility,
}: EscrowClauseProps) {
  const resolvedAgency = escrowAgencyName?.trim() || 'the designated escrow agency';
  const resolvedResponsibility =
    closingCostsResponsibility?.trim() || 'the party responsible for closing costs';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Escrow and Closing</h3>
      <p>
        Closing of this transaction shall be facilitated by <strong>{resolvedAgency}</strong>. Responsibility for closing
        costs shall be borne by <strong>{resolvedResponsibility}</strong>.
      </p>
    </section>
  );
}
