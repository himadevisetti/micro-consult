export const standardRetainerSchema = {
    clientName: { label: 'Client Name', type: 'text', required: true, placeholder: 'e.g. Acme Corp', clauseTemplate: 'This agreement is made with {{clientName}}.' },
    providerName: { label: 'Provider Name', type: 'text', required: true, placeholder: 'e.g. Jane Doe Law Firm', clauseTemplate: 'The provider of legal services is {{providerName}}.' },
    feeAmount: {
        label: 'Fee Amount',
        type: 'number',
        required: true,
        placeholder: 'e.g. 2000.00',
        clauseTemplate: 'The total fee is {{feeAmount}}.',
        validate: (val) => {
            const num = parseFloat(val);
            return (!isNaN(num) &&
                num >= 0 &&
                /^\d+(\.\d{1,2})?$/.test(val.trim()));
        }
    },
    feeStructure: {
        label: 'Fee Structure',
        type: 'dropdown',
        required: true,
        placeholder: 'Select fee structure',
        options: ['Flat', 'Hourly', 'Monthly', 'Contingency'],
        clauseTemplate: 'The client agrees to a fee structure of {{feeStructure}}.',
        default: 'Flat'
    },
    retainerAmount: {
        label: 'Retainer Amount (Optional)',
        type: 'number',
        required: false,
        placeholder: 'e.g. 5000.00',
        clauseTemplate: 'A one-time retainer fee of {{retainerAmount}} will be charged.',
        validate: (val) => {
            if (!val)
                return true;
            const num = parseFloat(val);
            return (!isNaN(num) &&
                num >= 0 &&
                /^\d+(\.\d{1,2})?$/.test(val.trim()));
        },
        default: '0'
    },
    startDate: {
        label: 'Start Date',
        type: 'date',
        required: true,
        placeholder: 'MM/DD/YYYY',
        clauseTemplate: 'The agreement begins on {{startDate}}.',
        validate: (val) => {
            return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val);
        }
    },
    endDate: {
        label: 'End Date',
        type: 'date',
        required: true,
        placeholder: 'MM/DD/YYYY',
        clauseTemplate: 'The agreement ends on {{endDate}}.',
        validate: (val, form) => {
            if (!val || !form?.startDate)
                return false;
            const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(val) && /^\d{4}-\d{2}-\d{2}$/.test(form.startDate);
            return isValidFormat && val >= form.startDate;
        }
    },
    jurisdiction: {
        label: 'Jurisdiction',
        type: 'dropdown',
        required: false,
        placeholder: 'Select jurisdiction',
        options: ['California', 'New York', 'Texas', 'Other'],
        clauseTemplate: 'This agreement is governed by the laws of {{jurisdiction}}.',
        default: 'California'
    },
    matterDescription: {
        label: 'Matter Description',
        type: 'text',
        required: true,
        placeholder: 'e.g. IP Licensing Agreement',
        clauseTemplate: 'The purpose of this retainer is {{matterDescription}}.'
    }
};
