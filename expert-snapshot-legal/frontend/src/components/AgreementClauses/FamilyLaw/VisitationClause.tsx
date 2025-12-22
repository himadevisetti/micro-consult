// src/components/AgreementClauses/FamilyLaw/VisitationClause.tsx

import type { VisitationScheduleEntry } from '@/types/FamilyLawAgreementFormData';

type VisitationClauseProps = {
  visitationSchedule?: string;
  visitationScheduleEntries?: VisitationScheduleEntry[];
  holidaySchedule?: string;
};

export default function VisitationClause({
  visitationSchedule,
  visitationScheduleEntries,
  holidaySchedule,
}: VisitationClauseProps) {
  const resolvedSchedule = visitationSchedule?.trim() || 'Standard';
  const resolvedHoliday = holidaySchedule?.trim() || 'as mutually agreed';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Visitation</h3>
      <p>
        The visitation schedule shall follow the <strong>{resolvedSchedule}</strong> plan. Holiday
        visitation shall be <strong>{resolvedHoliday}</strong>.
      </p>
      {visitationScheduleEntries?.length ? (
        <ul>
          {visitationScheduleEntries.map((entry, i) => (
            <li key={i}>
              {entry.days.join(', ')}: {entry.hours.start} – {entry.hours.end}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

