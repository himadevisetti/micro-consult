// src/utils/normalizeFamilyLawAgreementFormData.ts

import type {
  FamilyLawAgreementFormData,
  FamilyLawAgreementType,
  CustodyType,
  DecisionMakingAuthority,
  VisitationSchedule,
  VisitationScheduleEntry,
  SupportPaymentFrequency,
  ChildSupportPaymentMethod,
  ChildSupportResponsibleParty,
  SpousalSupportResponsibleParty,
  PropertyDivisionMethod,
  DisputeResolution,
} from '../types/FamilyLawAgreementFormData';
import { normalizeFormDates, normalizeSingleDate } from './normalizeFormDates';

/**
 * Normalize incoming raw data into canonical form for storage/state.
 * Ensures all date fields are coerced into ISO format (`yyyy-mm-dd`).
 */
export function normalizeFamilyLawAgreementFormData(
  raw: Record<string, any>
): FamilyLawAgreementFormData {
  const base: FamilyLawAgreementFormData = {
    // Parties
    petitionerName: String(raw.petitionerName ?? ''),
    respondentName: String(raw.respondentName ?? ''),
    petitionerAddress: String(raw.petitionerAddress ?? ''),
    respondentAddress: String(raw.respondentAddress ?? ''),
    petitionerContact: String(raw.petitionerContact ?? ''),
    respondentContact: String(raw.respondentContact ?? ''),

    motherName: String(raw.motherName ?? ''),
    fatherName: String(raw.fatherName ?? ''),
    motherAddress: String(raw.motherAddress ?? ''),
    fatherAddress: String(raw.fatherAddress ?? ''),
    motherContact: String(raw.motherContact ?? ''),
    fatherContact: String(raw.fatherContact ?? ''),

    spouse1Name: String(raw.spouse1Name ?? ''),
    spouse2Name: String(raw.spouse2Name ?? ''),
    spouse1Address: String(raw.spouse1Address ?? ''),
    spouse2Address: String(raw.spouse2Address ?? ''),
    spouse1Contact: String(raw.spouse1Contact ?? ''),
    spouse2Contact: String(raw.spouse2Contact ?? ''),

    // Contract metadata
    agreementType: raw.agreementType as FamilyLawAgreementType,
    executionDate: typeof raw.executionDate === 'string' ? raw.executionDate : '',
    effectiveDate: typeof raw.effectiveDate === 'string' ? raw.effectiveDate : '',
    expirationDate: typeof raw.expirationDate === 'string' ? raw.expirationDate : '',
    governingLaw: String(raw.governingLaw ?? 'California'),

    // Divorce / Separation
    marriageDate: typeof raw.marriageDate === 'string' ? raw.marriageDate : '',
    separationDate: typeof raw.separationDate === 'string' ? raw.separationDate : '',
    groundsForDivorce: String(raw.groundsForDivorce ?? ''),

    // Custody / Visitation
    custodyType: raw.custodyType as CustodyType,
    childNames: Array.isArray(raw.childNames) ? raw.childNames.map(String) : [],
    childDOBs: Array.isArray(raw.childDOBs) ? raw.childDOBs.map(d => normalizeSingleDate(d)) : [],
    visitationSchedule: raw.visitationSchedule as VisitationSchedule,
    visitationScheduleEntries: Array.isArray(raw.visitationScheduleEntries)
      ? (raw.visitationScheduleEntries as VisitationScheduleEntry[])
      : [
        {
          days: [],
          hours: { start: '', end: '' },
        },
      ],
    holidaySchedule: String(raw.holidaySchedule ?? ''),
    decisionMakingAuthority: raw.decisionMakingAuthority as DecisionMakingAuthority,

    // Child Support
    motherIncome: raw.motherIncome !== undefined ? Number(raw.motherIncome) : undefined,
    fatherIncome: raw.fatherIncome !== undefined ? Number(raw.fatherIncome) : undefined,
    custodyPercentageMother: raw.custodyPercentageMother !== undefined ? Number(raw.custodyPercentageMother) : undefined,
    custodyPercentageFather: raw.custodyPercentageFather !== undefined ? Number(raw.custodyPercentageFather) : undefined,
    childSupportAmount: raw.childSupportAmount !== undefined ? Number(raw.childSupportAmount) : undefined,
    childSupportPaymentFrequency: raw.childSupportPaymentFrequency as SupportPaymentFrequency,
    childSupportPaymentMethod: raw.childSupportPaymentMethod as ChildSupportPaymentMethod,
    childSupportResponsibleParty: raw.childSupportResponsibleParty as ChildSupportResponsibleParty,
    healthInsuranceResponsibility: raw.healthInsuranceResponsibility as ChildSupportResponsibleParty,

    // Spousal Support
    spousalSupportAmount: raw.spousalSupportAmount !== undefined ? Number(raw.spousalSupportAmount) : undefined,
    spousalSupportDurationMonths: raw.spousalSupportDurationMonths !== undefined ? Number(raw.spousalSupportDurationMonths) : undefined,
    spousalSupportTerminationConditions: String(raw.spousalSupportTerminationConditions ?? ''),
    spousalSupportResponsibleParty: raw.spousalSupportResponsibleParty as SpousalSupportResponsibleParty,

    // Property Settlement
    propertyDivisionMethod: raw.propertyDivisionMethod as PropertyDivisionMethod,
    assetList: Array.isArray(raw.assetList) ? raw.assetList.map(String) : [],
    debtAllocation: String(raw.debtAllocation ?? ''),
    retirementAccounts: String(raw.retirementAccounts ?? ''),
    taxConsiderations: String(raw.taxConsiderations ?? ''),

    // Termination & Remedies
    terminationClause: String(raw.terminationClause ?? ''),
    disputeResolution: raw.disputeResolution as DisputeResolution,

    // Miscellaneous
    additionalProvisions: String(raw.additionalProvisions ?? ''),

    // Signatures
    petitionerSignatoryName: String(raw.petitionerSignatoryName ?? ''),
    petitionerSignatoryRole: String(raw.petitionerSignatoryRole ?? ''),
    respondentSignatoryName: String(raw.respondentSignatoryName ?? ''),
    respondentSignatoryRole: String(raw.respondentSignatoryRole ?? ''),

    motherSignatoryName: String(raw.motherSignatoryName ?? ''),
    motherSignatoryRole: String(raw.motherSignatoryRole ?? ''),
    fatherSignatoryName: String(raw.fatherSignatoryName ?? ''),
    fatherSignatoryRole: String(raw.fatherSignatoryRole ?? ''),

    spouse1SignatoryName: String(raw.spouse1SignatoryName ?? ''),
    spouse1SignatoryRole: String(raw.spouse1SignatoryRole ?? ''),
    spouse2SignatoryName: String(raw.spouse2SignatoryName ?? ''),
    spouse2SignatoryRole: String(raw.spouse2SignatoryRole ?? ''),
  };

  // ✅ Normalize scalar date fields
  return normalizeFormDates(base, [
    'executionDate',
    'effectiveDate',
    'expirationDate',
    'marriageDate',
    'separationDate',
  ]);
}

/**
 * Normalize already‑typed form data for validation/display.
 */
export function normalizeRawFamilyLawAgreementFormData(
  data: FamilyLawAgreementFormData
): FamilyLawAgreementFormData {
  return {
    ...normalizeFormDates(data, [
      'executionDate',
      'effectiveDate',
      'expirationDate',
      'marriageDate',
      'separationDate',
    ]),
    childDOBs: Array.isArray(data.childDOBs) ? data.childDOBs.map(d => normalizeSingleDate(d)) : [],
    visitationScheduleEntries: Array.isArray(data.visitationScheduleEntries)
      ? data.visitationScheduleEntries.map(entry => ({
        ...entry,
        hours: {
          start: entry.hours?.start ?? '',
          end: entry.hours?.end ?? '',
        },
      }))
      : [
        {
          days: [],
          hours: { start: '', end: '' },
        },
      ],
  };
}
