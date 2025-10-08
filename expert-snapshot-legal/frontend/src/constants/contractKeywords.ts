// src/constants/contractKeywords.ts

/**
 * Centralized domain vocabulary for contract candidate extraction.
 * All keyword families, headings, and whitelists live here so they can be
 * updated without touching parsing logic.
 */

export const CONTRACT_KEYWORDS = {
  headings: {
    clauseKeywords: [
      "standard retainer agreement",
      "parties",
      "scope of representation",
      "scope of work",
      "position and duties",
      "responsibilities",
      "description of services",
      "services",
      "engagement",
      "client responsibilities",
      "communication expectations",
      "fee structure",
      "retainer",
      "costs & expenses",
      "confidentiality",
      "termination",
      "governing law",
      "jurisdiction",
      "entire agreement",
      "signatures",
      // IPR&L‑specific
      "license terms",
      "ip validity",
      "invention assignment",
    ],
  },

  dates: {
    effective: ["effective", "commence", "start", "begin"],
    expiration: [
      "terminate",
      "termination",
      "expire",
      "expiration",
      "end date",
      "end",
    ],
    execution: ["executed", "signed", "dated", "as of"],
    monthDateRegex:
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/gi,
  },

  amounts: {
    fee: ["fee", "flat", "hourly", "contingency"],
    retainer: ["retainer", "deposit", "advance", "advance payment"],
    feeStructure: {
      Flat: ["flat"],
      Hourly: ["hour", "per hour"],
      Monthly: ["monthly", "per month"],
      Contingency: ["contingency", "contingent"],
    },
    feeContext: [
      "fee",
      "fees",
      "compensation",
      "payment",
      "remuneration",
      "charges",
      "billing",
      "consideration",
      "retainer",
      "deposit",
      "advance",
    ],
    retainerCues: ["retainer", "deposit", "advance"],
  },

  parties: {
    roleLabels: [
      "client",
      "attorney",
      "provider",
      "consultant",
      "company",
      "firm",
      "inventor",
      "filing party", // signature block role
    ],
    inventorCues: [
      "inventor",
      "created by",
      "invented by",
      "originated by",
      "conceived by",
    ],
  },

  governingLaw: {
    cues: [
      "governing law",
      "jurisdiction",
      "laws of",
      "construed in accordance",
    ],
  },

  scope: {
    headings: [
      "scope of representation",
      "scope of work",
      "position and duties",
      "responsibilities",
      "description of services",
      "job description",
      "services",
      "engagement",
      "intellectual property description",
    ],
    cues: [
      "represent",
      "representation",
      "engage",
      "engagement",
      "services",
      "scope",
      "responsibilities",
      "duties",
      "work to be performed",
      "scope of work",
      "description of services",
      "intellectual property description",
      "ip description",
      "position",
      "role",
      "functions",
      "obligations",
      "tasks",
      "assignments",
      "job description",
      "services to be rendered",
      "consulting services",
      "work responsibilities",
    ],
  },

  ip: {
    typeCues: ["patent", "trademark", "copyright", "trade secret", "ip type"],
    licenseScopeCues: [
      "worldwide",
      "exclusive",
      "non-exclusive",
      "perpetual",
      "territory",
    ],
    inventionAssignmentCues: [
      "assigns all rights",
      "invention assignment",
      "hereby assigns",
    ],
    // descriptionCues removed — unified under scope.cues
  },

  textAnchors: {
    ignoreHeadings: ["table of contents", "exhibit", "schedule"],
  },
};

// Recognized placeholder schema fields
export const PLACEHOLDER_KEYWORDS: Set<string> = new Set([
  "partyA",
  "partyB",
  "client",
  "provider",
  "inventor",
  "effectiveDate",
  "executionDate",
  "expirationDate",
  "contractDuration",
  "feeAmount",
  "retainerAmount",
  "filingParty",
  "ipType",
  "licenseScope",
  "inventionAssignment",
  "scope",
  "feeStructure",
  "governingLaw",
]);

// Regex to detect {{placeholders}}
export const PLACEHOLDER_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;

// User‑friendly labels for schema fields
export const FIELD_LABELS: Record<string, string> = {
  scope: "Scope",
  partyA: "Party A",
  partyB: "Party B",
  client: "Client",
  provider: "Provider",
  inventor: "Inventor",
  effectiveDate: "Effective Date",
  executionDate: "Execution Date",
  expirationDate: "Expiration Date",
  contractDuration: "Contract Duration",
  feeAmount: "Fee Amount",
  retainerAmount: "Retainer Amount",
  filingParty: "Filing Party",
  ipType: "IP Type",
  licenseScope: "License Scope",
  inventionAssignment: "Invention Assignment",
  governingLaw: "Governing Law",
  feeStructure: "Fee Structure",
};
