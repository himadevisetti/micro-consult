import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function GoverningLawClause({ jurisdiction }) {
    const resolvedJurisdiction = jurisdiction?.trim() || 'California';
    return (_jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Governing Law" }), _jsxs("p", { children: ["This Agreement shall be governed by and construed in accordance with the laws of", ' ', _jsx("strong", { children: resolvedJurisdiction }), ", without regard to its conflicts of law principles."] })] }));
}
