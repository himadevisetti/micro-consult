export const standardRetainerSchema = {
  clientName: {
    label: 'Client Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Acme Corp',
  },
  feeStructure: {
    label: 'Fee Structure',
    type: 'text',
    required: true,
    placeholder: 'e.g. $5,000 flat fee',
  },
  startDate: {
    label: 'Start Date',
    type: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
  },
  endDate: {
    label: 'End Date',
    type: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
  },
  retainerPurpose: {
    label: 'Retainer Purpose',
    type: 'text',
    required: false,
    placeholder: 'e.g. IP Licensing Agreement',
  },
};
