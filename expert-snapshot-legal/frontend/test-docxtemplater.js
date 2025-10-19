// test-docxtemplater.js
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node test-docxtemplater.js <path-to-docx>");
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);
const zip = new PizZip(buffer);

try {
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  console.log("=== Full text ===");
  console.log((doc).getFullText?.());

  console.log("\n=== Tags ===");
  console.log((doc).getTags?.());
} catch (err) {
  console.error("Docxtemplater error:", err);
}

