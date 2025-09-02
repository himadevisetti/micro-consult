type InventionAssignmentClauseProps = {
  clientName?: string; // already normalized
};

export default function InventionAssignmentClause({ clientName }: InventionAssignmentClauseProps) {
  const resolvedClient = clientName?.trim() || 'Client';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Invention Assignment</h3>
      <p>
        The inventor hereby assigns all rights, title, and interest in the intellectual property to
        the <strong>{resolvedClient}</strong>. This assignment includes all derivative works, improvements, and related
        inventions, whether conceived prior to or during the term of this agreement.
      </p>
    </section>
  );
}

