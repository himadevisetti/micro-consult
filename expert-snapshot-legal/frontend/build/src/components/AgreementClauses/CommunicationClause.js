import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function CommunicationClause({ clientName }) {
    const resolvedClient = clientName?.trim() || 'Client';
    return (_jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Communication Expectations" }), _jsxs("p", { children: ["All substantive communications will be directed to ", _jsx("strong", { children: resolvedClient }), ". Email shall serve as the primary channel unless otherwise agreed upon."] })] }));
}
