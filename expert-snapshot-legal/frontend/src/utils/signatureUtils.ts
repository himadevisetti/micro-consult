// signatureUtils.ts

import { Paragraph, TextRun } from 'docx';

export function getSignatureBlock(raw: Record<string, string>): Paragraph[] {
  const client = raw.clientName?.trim() || 'Client';
  const group = raw.legalGroup?.trim() || 'Attorney';
  const executionDate = raw.executionDate?.trim() || 'the date of execution';
  const font = 'Times New Roman';

  const signatureLine = () =>
    new Paragraph({
      spacing: { before: 200, after: 0 },
      alignment: 'left',
      children: [
        new TextRun({
          text: '__________________________', // precise line length
          font,
          bold: false,
          size: 24, // optional for better print/render consistency
        }),
      ],
    });

  const nameLine = (name: string) =>
    new Paragraph({
      spacing: { before: 100, after: 200 },
      children: [new TextRun({ text: name, bold: true, font })],
    });

  return [
    new Paragraph({
      spacing: { before: 150, after: 100 },
      children: [new TextRun({ text: 'Signatures', bold: true, font })],
    }),

    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `IN WITNESS WHEREOF, the parties have executed this Agreement as of ${executionDate}.`,
          font,
        }),
      ],
    }),

    ...[client, group].flatMap((name) => [signatureLine(), nameLine(name)]),
  ];
}
