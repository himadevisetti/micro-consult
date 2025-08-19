import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function TerminationClause({ endDate, }) {
    const resolvedEndDate = endDate?.trim() || 'the end date of this Agreement';
    return (_jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Termination" }), _jsxs("p", { children: ["Either party may terminate this agreement with written notice. Client remains responsible for fees incurred through the date of termination. This agreement will automatically terminate on ", _jsx("strong", { children: resolvedEndDate }), " unless extended in writing."] })] }));
}
