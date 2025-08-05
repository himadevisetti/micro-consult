import { Document, Packer, Paragraph, TextRun } from 'docx';
import { formatClauseContent } from '../formatClauseContent';
import { clauses } from '../clauses';

function cleanClauseBody(body: string): string {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.join('\n');
}

export async function generateDOCX(
  data: Record<string, string>,
  signatureBlock: Paragraph[] // ✅ trusted, already-built block
) {
  const sections: Paragraph[] = [];

  // 📄 Document title
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Legal Retainer Agreement', bold: true, size: 36 })],
      alignment: 'center',
      spacing: { after: 400 },
    })
  );

  // 🧩 Clause rendering
  for (const clauseKey of Object.keys(clauses).filter((key) => key !== 'signatureClause')) {
    const clauseBody = data[clauseKey];
    if (!clauseBody) continue;

    const cleanedBody = cleanClauseBody(clauseBody);
    const formattedLines = formatClauseContent(cleanedBody);

    sections.push(
      ...formattedLines.map(
        ({ text, bold }) =>
          new Paragraph({
            children: [new TextRun({ text, bold })],
            spacing: { after: 100 },
          })
      )
    );
  }

  // ✍️ Signature block — single, delegated injection
  if (signatureBlock?.length) {
    sections.push(...signatureBlock);
  }

  const doc = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const buffer = await Packer.toBuffer(doc);
  const safeBuffer = new Uint8Array(buffer);
  return new Blob([safeBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

}
