import { Document, Packer, Paragraph, TextRun } from 'docx';
import { formatClauseContent } from '../formatClauseContent.js';

type DOCXInput = {
  html: string;
  filename?: string; // optional, for future use
};

function cleanClauseBody(body: string): string {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.join('\n');
}

export async function generateDOCX(input: DOCXInput): Promise<Blob> {
  const { html } = input;

  const sections: Paragraph[] = [];

  // 📄 Document title
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'STANDARD RETAINER AGREEMENT', bold: true, size: 32 })],
      alignment: 'center',
      spacing: { after: 300 },
    })
  );

  // 🧩 Clause rendering from full HTML
  const cleanedBody = cleanClauseBody(html);
  const formattedLines = formatClauseContent(cleanedBody);

  const paragraphTuples = formattedLines.map(({ text, bold }, index) => {
    const isHeading = bold === true;
    const isLast = index === formattedLines.length - 1;

    const paragraph = new Paragraph({
      children: [
        new TextRun({
          text,
          bold: isHeading,
          size: isHeading ? 26 : 22,
        }),
      ],
      spacing: {
        after: isHeading ? 300 : isLast ? 600 : 300,
      },
      keepLines: isHeading,
      keepNext: isHeading,
    });

    return [text, paragraph] as const;
  });

  const witnessIndex = paragraphTuples.findIndex(([text]) =>
    text.toUpperCase().includes("IN WITNESS WHEREOF")
  );

  if (witnessIndex > 0) {
    const insertIndex = witnessIndex - 1;
    paragraphTuples.splice(insertIndex, 0,
      ["", new Paragraph({ spacing: { after: 200 } })],
      ["", new Paragraph({ spacing: { after: 200 } })]
    );
  }

  const htmlParagraphs = paragraphTuples.map(([_, p]) => p);
  sections.push(...htmlParagraphs);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Georgia', size: 20 },
          paragraph: { spacing: { after: 100 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 2160, // ✅ Increased top margin to 1.5 inch
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
