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
        // canonical
        "scope of representation",
        "scope of work",
        "scope of license",
        "scope of use",
        "scope of services",
        // ambiguous (only used as fallback with cue check)
        "position and duties",
        "responsibilities",
        "description of services",
        "job description",
        "services"
      ],
      fees: [
        "fees & engagement terms",
        "fee structure",
        "retainer",
        "fees & payment",
        "fees",
        "payment terms",
        "payment",
        "compensation",
        "engagement"
      ],
      expenses: [
        "costs & expenses",
        "expenses"
      ],
      confidentiality: ["confidentiality", "nondisclosure"],
      governingLaw: ["governing law", "jurisdiction"],
      inventionAssignment: [
        "invention assignment",
        "assignment of inventions",
        "assignment of intellectual property",
      ],
      licenseTerms: ["license terms"],
      ipValidity: [
        "ip validity",
        "ip description",
        "intellectual property description",
      ],
      entireAgreement: ["entire agreement", "entire agreement & amendments"],
      signatures: [
        "signatures",
        "signature",
        "execution",
        "signatory",
        "signatories",
        "witness",
        "acknowledged by",
        "notary"
      ],
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
      Hourly: ["hourly", "per hour"],
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

  governingLaw: {
    cues: [
      "laws of",
      "governed by the laws of",
      "under the laws of",
      "subject to the laws of",
      "construed in accordance with the laws of",
    ],
  },

  textAnchors: {
    ignoreHeadings: ["table of contents", "exhibit", "schedule"],
  },
};

// Recognized placeholder schema fields
export const PLACEHOLDER_KEYWORDS: Record<string, string> = {
  partya: "partyA",
  partyb: "partyB",
  client: "client",
  provider: "provider",
  inventor: "inventor",            // inventor1, inventor2 handled by digits
  effectivedate: "effectiveDate",
  executiondate: "executionDate",
  expirationdate: "expirationDate",
  contractduration: "contractDuration",
  feeamount: "feeAmount",
  retaineramount: "retainerAmount",
  filingparty: "filingParty",
  iptype: "ipType",
  licensescope: "licenseScope",
  inventionassignment: "inventionAssignment",
  scope: "scope",
  feestructure: "feeStructure",
  governinglaw: "governingLaw",
  signatory: "signatory",          // signatory1, signatory2 handled by digits
};

// Regex to detect [[placeholders]]
export const PLACEHOLDER_REGEX = /\[\[([a-zA-Z0-9_]+)\]\]/g;

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

export const MONTH_KEYWORDS = [
  "January", "Jan",
  "February", "Feb",
  "March", "Mar",
  "April", "Apr",
  "May",
  "June", "Jun",
  "July", "Jul",
  "August", "Aug",
  "September", "Sep", "Sept",
  "October", "Oct",
  "November", "Nov",
  "December", "Dec"
];

// Known acronyms that should always be uppercased in labels
export const ACRONYMS = new Set([
  "ip",
  "llc",
  "ssn",
  "dob",
  "ein",
  "nda",
  "mou",
  "usa",
  "uk",
]);

export const ENUM_OPTIONS: Record<string, string[]> = {
  feeStructure: ["Contingency", "Hourly", "Flat"],
  licenseScope: ["Worldwide", "Exclusive", "Non-exclusive"],
  ipType: ["Patent", "Trademark", "Copyright", "Trade Secret"],
};
