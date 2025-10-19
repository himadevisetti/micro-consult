// debugDocxTemplate.cjs
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node debugDocxTemplate.cjs <path-to-docx>");
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);
const zip = new PizZip(buffer);
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

console.log("=== Full text ===");
console.log(doc.getFullText());

console.log("\n=== Tags ===");
console.log(doc.getTags());

const xml = zip.file("word/document.xml").asText();
console.log("\n=== Raw XML (first 500 chars) ===");
console.log(xml.substring(0, 500));

