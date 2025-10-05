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
    headings: ["scope of representation", "services", "engagement"],
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
    ],
  },

  textAnchors: {
    ignoreHeadings: ["table of contents", "exhibit", "schedule"],
  },
};
