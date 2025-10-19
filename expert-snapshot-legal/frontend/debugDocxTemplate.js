"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugDocxTemplate = debugDocxTemplate;
// debugDocxTemplate.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
function debugDocxTemplate(filePath) {
    var _a;
    const buffer = fs_1.default.readFileSync(filePath);
    const zip = new pizzip_1.default(buffer);
    const doc = new docxtemplater_1.default(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    console.log("=== Full text Docxtemplater sees ===");
    console.log(doc.getFullText());
    console.log("\n=== Tags Docxtemplater detected ===");
    console.log(doc.getTags());
    // Optional: dump raw XML for deeper inspection
    const xml = (_a = zip.file("word/document.xml")) === null || _a === void 0 ? void 0 : _a.asText();
    if (xml) {
        console.log("\n=== Raw XML snippet around tags ===");
        // Just show first 500 chars for sanity
        console.log(xml.substring(0, 500));
    }
}
// Run directly from CLI
if (require.main === module) {
    const file = process.argv[2];
    if (!file) {
        console.error("Usage: ts-node debugDocxTemplate.ts <path-to-docx>");
        process.exit(1);
    }
    debugDocxTemplate(path_1.default.resolve(file));
}
