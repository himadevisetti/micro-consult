// src/components/AgreementClauses/RealEstate/PartiesClause.tsx

type PartiesClauseProps = {
  buyerName?: string;
  sellerName?: string;
  tenantName?: string;
  landlordName?: string;
  brokerName?: string;
  executionDate?: string; // already formatted, e.g. "December 11, 2025"
  contractType?: string;
};

export default function PartiesClause({
  buyerName,
  sellerName,
  tenantName,
  landlordName,
  brokerName,
  executionDate,
  contractType,
}: PartiesClauseProps) {
  const resolvedBuyer = buyerName?.trim() || 'the Buyer';
  const resolvedSeller = sellerName?.trim() || 'the Seller';
  const resolvedTenant = tenantName?.trim() || 'the Tenant';
  const resolvedLandlord = landlordName?.trim() || 'the Landlord';
  const resolvedBroker = brokerName?.trim() || 'the Broker';
  const resolvedDate = executionDate?.trim() || 'the execution date of this Agreement';

  let partiesText = '';
  switch (contractType) {
    case 'Purchase':
      partiesText = `between ${resolvedBuyer} and ${resolvedSeller}`;
      break;
    case 'Lease':
      partiesText = `between ${resolvedTenant} and ${resolvedLandlord}`;
      break;
    case 'Listing':
      partiesText = `between ${resolvedSeller} and ${resolvedBroker}`;
      break;
    case 'Option':
      partiesText = `between ${resolvedBuyer} and ${resolvedSeller}`;
      break;
    default:
      partiesText = `between the Parties`;
  }

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Real Estate Contract (“Agreement”) is entered into {partiesText}, effective as of{' '}
        <strong>{resolvedDate}</strong>.
      </p>
    </section>
  );
}
