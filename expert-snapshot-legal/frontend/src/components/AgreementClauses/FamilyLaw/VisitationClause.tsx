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
  const scheduleType = visitationSchedule?.trim() || 'Standard';

  // Normalize holiday text and fix punctuation
  const cleanedHoliday = holidaySchedule
    ?.trim()
    ?.replace(/New Years/gi, "New Year’s");

  const hasHolidayList = cleanedHoliday && cleanedHoliday.length > 0;

  // Build schedule text (comma-separated)
  const scheduleText = visitationScheduleEntries?.length
    ? visitationScheduleEntries
      .map(
        (entry) =>
          `${entry.days.join(', ')}: ${entry.hours.start} – ${entry.hours.end}`
      )
      .join(', ')
    : '';

  // Build the opening sentence based on schedule type
  let openingSentence = '';

  switch (scheduleType) {
    case 'Standard':
      openingSentence = `The visitation schedule shall follow the Standard plan.`;
      break;

    case 'Custom':
      openingSentence = `The visitation schedule shall follow the Custom plan.`;
      break;

    case 'HolidayOnly':
      openingSentence = `The visitation schedule shall follow a Holiday‑Only plan.`;
      break;

    case 'None':
      openingSentence = `There shall be no visitation schedule.`;
      break;

    default:
      openingSentence = `The visitation schedule shall follow the ${scheduleType} plan.`;
      break;
  }

  // Add lead‑in phrase only when schedule entries exist
  const scheduleLeadIn = scheduleText
    ? ` The schedule is as follows: ${scheduleText}.`
    : '';

  // Holiday sentence logic (NO HTML tags)
  const holidaySentence = hasHolidayList
    ? ` Holiday visitation shall be ${cleanedHoliday}.`
    : ` There shall be no holiday visitation.`;

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Visitation</h3>

      <p>
        {openingSentence}
        {scheduleLeadIn}
        {holidaySentence}
      </p>
    </section>
  );
}
