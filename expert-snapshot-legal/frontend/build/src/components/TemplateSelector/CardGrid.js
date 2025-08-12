import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const CardGrid = ({ templates, onSelect }) => {
    return (_jsx("div", { className: "card-grid", children: templates.map(({ id, title, jurisdiction, tags }) => (_jsxs("div", { className: "template-card", children: [_jsx("h3", { children: title }), _jsx("p", { children: jurisdiction }), _jsx("ul", { children: tags?.map((tag, index) => (_jsx("li", { children: tag }, index))) }), _jsx("button", { onClick: () => onSelect(id), children: "Select" })] }, id))) }));
};
export default CardGrid;
