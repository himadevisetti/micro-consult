import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ScopeClause({ matterDescription }) {
    const resolvedPurpose = matterDescription?.trim() || 'general legal services';
    return (_jsxs("section", { children: [_jsx("h3", { style: { fontWeight: 'bold' }, children: "Scope of Representation" }), _jsxs("p", { children: ["The Attorney agrees to represent the Client in connection with", ' ', _jsx("strong", { children: resolvedPurpose }), ". The scope includes professional services reasonably related to this purpose and excludes unrelated legal issues unless agreed upon in writing."] })] }));
}
