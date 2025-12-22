// src/components/AgreementClauses/FamilyLaw/PartiesClause.tsx

type PartiesClauseProps = {
  // Divorce
  petitionerName?: string;
  respondentName?: string;
  petitionerAddress?: string;
  respondentAddress?: string;
  petitionerContact?: string;
  respondentContact?: string;

  // Custody / Child Support
  motherName?: string;
  fatherName?: string;
  motherAddress?: string;
  fatherAddress?: string;
  motherContact?: string;
  fatherContact?: string;

  // Spousal Support / Property Settlement
  spouse1Name?: string;
  spouse2Name?: string;
  spouse1Address?: string;
  spouse2Address?: string;
  spouse1Contact?: string;
  spouse2Contact?: string;

  executionDate?: string; // already formatted, e.g. "December 21, 2025"
};

export default function PartiesClause(props: PartiesClauseProps) {
  const {
    petitionerName,
    respondentName,
    petitionerAddress,
    respondentAddress,
    petitionerContact,
    respondentContact,
    motherName,
    fatherName,
    motherAddress,
    fatherAddress,
    motherContact,
    fatherContact,
    spouse1Name,
    spouse2Name,
    spouse1Address,
    spouse2Address,
    spouse1Contact,
    spouse2Contact,
    executionDate,
  } = props;

  // Resolve whichever pair is provided
  const resolvedPartyA =
    petitionerName?.trim() ||
    motherName?.trim() ||
    spouse1Name?.trim() ||
    'Party A';
  const resolvedPartyB =
    respondentName?.trim() ||
    fatherName?.trim() ||
    spouse2Name?.trim() ||
    'Party B';

  const resolvedDate = executionDate?.trim() || 'the execution date of this Agreement';

  const resolvedPartyAAddress =
    petitionerAddress?.trim() ||
    motherAddress?.trim() ||
    spouse1Address?.trim() ||
    '';
  const resolvedPartyBAddress =
    respondentAddress?.trim() ||
    fatherAddress?.trim() ||
    spouse2Address?.trim() ||
    '';
  const resolvedPartyAContact =
    petitionerContact?.trim() ||
    motherContact?.trim() ||
    spouse1Contact?.trim() ||
    '';
  const resolvedPartyBContact =
    respondentContact?.trim() ||
    fatherContact?.trim() ||
    spouse2Contact?.trim() ||
    '';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Family Law Agreement (“Agreement”) is entered into between{' '}
        <strong>{resolvedPartyA}</strong>
        {resolvedPartyAAddress && ` of ${resolvedPartyAAddress}`}
        {resolvedPartyAContact && ` (Contact: ${resolvedPartyAContact})`} and{' '}
        <strong>{resolvedPartyB}</strong>
        {resolvedPartyBAddress && ` of ${resolvedPartyBAddress}`}
        {resolvedPartyBContact && ` (Contact: ${resolvedPartyBContact})`}, effective as of{' '}
        <strong>{resolvedDate}</strong>.
      </p>
    </section>
  );
}
