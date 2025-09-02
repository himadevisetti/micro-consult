type ExpirationClauseProps = {
  expirationDate?: string;
};

export default function ExpirationClause({ expirationDate }: ExpirationClauseProps) {
  const resolvedDate = expirationDate?.trim() || 'the expiration date of the IP';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>IP Validity</h3>
      <p>
        The intellectual property covered by this agreement remains valid through{' '}
        <strong>{resolvedDate}</strong>, unless renewed, extended, or terminated earlier by mutual
        agreement or operation of law.
      </p>
    </section>
  );
}

