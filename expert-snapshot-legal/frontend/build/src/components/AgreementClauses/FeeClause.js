import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function FeeClause({ structure, feeAmount, retainerAmount, jurisdiction, }) {
    const resolvedStructure = structure?.trim() || 'hourly';
    const resolvedFee = feeAmount?.trim() || '350';
    const resolvedRetainer = retainerAmount?.trim() || '1500';
    const resolvedJurisdiction = jurisdiction?.trim() || 'California';
    return (_jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Fee Structure & Retainer" }), _jsxs("p", { children: ["Fees shall be billed under a ", _jsx("strong", { children: resolvedStructure }), " model at a rate of", _jsxs("strong", { children: [" $", resolvedFee, "/hour"] }), ". An initial retainer of", ' ', _jsxs("strong", { children: ["$", resolvedRetainer] }), " is due upon execution. Refunds, if any, shall comply with the laws of ", _jsx("strong", { children: resolvedJurisdiction }), "."] })] }));
}
