// src/constants/contractKeywords.ts

/**
 * Centralized domain vocabulary for contract candidate extraction.
 * All keyword families, headings, and whitelists live here so they can be
 * updated without touching parsing logic.
 */

/**
 * Centralized domain vocabulary for contract candidate extraction.
 * All keyword families, headings, and whitelists live here so they can be
 * updated without touching parsing logic.
 */

export const CONTRACT_KEYWORDS = {
  headings: {
    byField: {
      parties: [
        "parties",
        "the parties",
        "between",
        "inventors",
        "inventor",
        "inventor(s)",
        "named inventors"
      ],
      scope: [
        "scope of representation",
        "scope of work",
        "ip description",
        "intellectual property description",
        "position and duties",
        "responsibilities",
        "description of services",
        "job description",
        "services",
        "engagement",
      ],
      fees: [
        "fees & engagement terms",
        "fee structure",
        "retainer",
        "costs & expenses",
        "compensation",
      ],
      confidentiality: ["confidentiality", "nondisclosure"],
      governingLaw: ["governing law", "jurisdiction"],
      inventionAssignment: [
        "invention assignment",
        "assignment of inventions",
        "assignment of intellectual property",
      ],
      licenseTerms: ["license terms"],
      ipValidity: ["ip validity"],
      entireAgreement: ["entire agreement", "entire agreement & amendments"],
      signatures: ["signatures"],
      standardRetainer: ["standard retainer agreement"],
    },
  },

  signatures: {
    ignore: [
      "in witness whereof",
      "signed",
      "executed",
      "witness",
      // add any other boilerplate phrases you want to skip
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
    // descriptionCues removed — unified under scope.byField
  },

  textAnchors: {
    ignoreHeadings: ["table of contents", "exhibit", "schedule"],
  },
};

// Recognized placeholder schema fields
export const PLACEHOLDER_KEYWORDS: Record<string, string> = {
  partya: "PartyA",
  partyb: "PartyB",
  client: "Client",
  provider: "Provider",
  inventor: "Inventor",
  effectivedate: "EffectiveDate",
  executiondate: "ExecutionDate",
  expirationdate: "ExpirationDate",
  contractduration: "ContractDuration",
  feeamount: "FeeAmount",
  retaineramount: "RetainerAmount",
  filingparty: "FilingParty",
  iptype: "IPType",
  licensescope: "LicenseScope",
  inventionassignment: "InventionAssignment",
  scope: "Scope",
  feestructure: "FeeStructure",
  governinglaw: "GoverningLaw",
  signatory: "Signatory",
};

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
  signatory: "Signatory",
};

export const ENUM_OPTIONS: Record<string, string[]> = {
  feeStructure: ["Contingency", "Hourly", "Flat Fee"],
  licenseScope: ["Worldwide", "Exclusive", "Non-exclusive"],
};
