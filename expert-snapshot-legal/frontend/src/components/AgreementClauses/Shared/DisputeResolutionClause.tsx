type DisputeResolutionClauseProps = {
  method: 'Arbitration' | 'Mediation' | 'Court';
  jurisdiction?: string;
};

export default function DisputeResolutionClause({ method, jurisdiction }: DisputeResolutionClauseProps) {
  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Dispute Resolution</h3>
      <p>
        Any dispute arising out of or relating to this Agreement shall{' '}
        {method === 'Mediation' && <>first be submitted to <strong>Mediation</strong></>}
        {method === 'Arbitration' && <>be resolved by binding <strong>Arbitration</strong></>}
        {method === 'Court' && <>be resolved in the <strong>Court</strong> of competent jurisdiction</>}
        {jurisdiction && <> in <strong>{jurisdiction}</strong></>}
        {method !== 'Court' && (
          <>
            , in accordance with the rules of the <strong>American Arbitration Association</strong>.
          </>
        )}
        {method === 'Court' && '.'}
      </p>
    </section>
  );
}
