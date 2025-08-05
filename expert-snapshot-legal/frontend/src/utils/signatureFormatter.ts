import { Paragraph, TextRun } from 'docx';

export function formatSignatures(signatories: string[]): Paragraph[] {
  return signatories.flatMap((name) => [
    // Signature line paragraph
    new Paragraph({
      spacing: { before: 200, after: 0 },
      children: [
        new TextRun({
          text: '__________________________',
          bold: true,
        }),
      ],
    }),

    // Name paragraph directly below the line
    new Paragraph({
      spacing: { before: 100, after: 200 },
      children: [
        new TextRun({
          text: name,
          bold: true,
        }),
      ],
    }),
  ]);
}
