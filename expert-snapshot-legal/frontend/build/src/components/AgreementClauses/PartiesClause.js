import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function PartiesClause({ clientName, legalGroup, effectiveDate, }) {
    const resolvedClient = clientName?.trim() || 'the Client';
    const resolvedGroup = legalGroup?.trim() || 'the Attorney';
    const resolvedDate = effectiveDate?.trim() || 'the effective date of this Agreement';
    return (_jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Parties" }), _jsxs("p", { children: ["This Agreement is entered into between ", _jsx("strong", { children: resolvedClient }), " and", ' ', _jsx("strong", { children: resolvedGroup }), ", effective as of ", _jsx("strong", { children: resolvedDate }), "."] })] }));
}
