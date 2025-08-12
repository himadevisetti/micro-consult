import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function SignatureClause({ clientName, legalGroup, executionDate, }) {
    const resolvedClient = clientName?.trim() || 'Client';
    const resolvedGroup = legalGroup?.trim() || 'Attorney';
    const resolvedDate = executionDate?.trim() || 'the date of execution';
    return (_jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Signatures" }), _jsxs("p", { children: ["IN WITNESS WHEREOF, the parties have executed this Agreement as of", ' ', _jsx("strong", { children: resolvedDate }), "."] }), _jsx("p", { children: "__________________________" }), _jsx("p", { children: _jsx("strong", { children: resolvedClient }) }), _jsx("p", { children: "__________________________" }), _jsx("p", { children: _jsx("strong", { children: resolvedGroup }) })] }));
}
