import { Paragraph, TextRun } from 'docx';
export function getSignatureBlock(raw) {
    const client = raw.clientName?.trim() || 'Client';
    const group = raw.legalGroup?.trim() || 'Attorney';
    const executionDate = raw.executionDate?.trim() || 'the date of execution';
    const font = 'Georgia';
    const signatureLine = () => new Paragraph({
        spacing: { before: 80, after: 0 }, // Reduced spacing
        alignment: 'left',
        children: [
            new TextRun({
                text: '__________________________',
                font,
                bold: false,
                size: 20, // Matches body text
            }),
        ],
    });
    const nameLine = (name) => new Paragraph({
        spacing: { before: 40, after: 100 }, // Reduced spacing
        children: [
            new TextRun({
                text: name,
                bold: true,
                font,
                size: 20, // Matches body text
            }),
        ],
    });
    return [
        new Paragraph({
            spacing: { before: 40, after: 60 }, // Reduced from 150/100
            children: [
                new TextRun({
                    text: 'Signatures',
                    bold: true,
                    font,
                    size: 26, // Matches heading size
                }),
            ],
        }),
        new Paragraph({
            spacing: { after: 100 }, // Reduced from 300
            children: [
                new TextRun({
                    text: `IN WITNESS WHEREOF, the parties have executed this Agreement as of ${executionDate}.`,
                    font,
                    size: 20, // Matches body text
                }),
            ],
        }),
        ...[client, group].flatMap((name) => [signatureLine(), nameLine(name)]),
    ];
}
