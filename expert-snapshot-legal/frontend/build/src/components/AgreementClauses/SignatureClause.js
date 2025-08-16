import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export default function SignatureClause({ clientName, providerName, executionDate, }) {
    const resolvedClient = clientName?.trim() || 'Client';
    const resolvedProvider = providerName?.trim() || 'Attorney';
    const resolvedDate = executionDate?.trim() || 'the date of execution';
    return (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsx("br", {}), _jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Signatures" }), _jsxs("p", { children: ["IN WITNESS WHEREOF, the parties have executed this Agreement as of", ' ', _jsx("strong", { children: resolvedDate }), "."] }), _jsx("p", { children: "__________________________" }), _jsx("p", { children: _jsx("strong", { children: resolvedClient }) }), _jsx("p", { children: "__________________________" }), _jsx("p", { children: _jsx("strong", { children: resolvedProvider }) })] })] }));
}
