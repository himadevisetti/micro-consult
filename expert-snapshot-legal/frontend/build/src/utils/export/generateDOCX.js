import { Document, Packer, Paragraph, TextRun } from 'docx';
import { formatClauseContent } from '../formatClauseContent.js';
import { clauses } from '../clauses.js';
function cleanClauseBody(body) {
    const lines = body
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    return lines.join('\n');
}
export async function generateDOCX(data, signatureBlock) {
    const sections = [];
    const resolvedClient = data.clientName || 'the Client';
    const resolvedGroup = data.legalGroup || 'the Attorney';
    const resolvedDate = data.executionDate || 'the date of execution';
    // 📄 Document title
    sections.push(new Paragraph({
        children: [new TextRun({ text: 'Legal Retainer Agreement', bold: true, size: 48 })],
        alignment: 'center',
        spacing: { after: 400 },
    }));
    // 🧩 Clause rendering
    for (const clauseKey of Object.keys(clauses).filter((key) => key !== 'signatureClause')) {
        const clauseBody = data[clauseKey];
        if (!clauseBody)
            continue;
        const cleanedBody = cleanClauseBody(clauseBody);
        const formattedLines = formatClauseContent(cleanedBody);
        const clauseParagraphs = formattedLines.map(({ text, bold }, index) => {
            const isHeading = index === 0 && bold;
            const isLast = index === formattedLines.length - 1;
            const replacedText = text
                .replace(/the Client/g, resolvedClient)
                .replace(/the Attorney/g, resolvedGroup)
                .replace(/the date of execution/g, resolvedDate);
            return new Paragraph({
                children: [
                    new TextRun({
                        text: replacedText,
                        bold,
                        size: isHeading ? 26 : 22, // 🔧 Reduced from 36/32 to ~15pt/13pt
                    }),
                ],
                spacing: {
                    after: isHeading ? 200 : isLast ? 300 : 100,
                },
                keepLines: isHeading,
                keepNext: isHeading,
            });
        });
        sections.push(...clauseParagraphs);
    }
    // ✍️ Signature block — single, delegated injection
    if (signatureBlock?.length) {
        sections.push(new Paragraph({ spacing: { after: 200 } }), new Paragraph({ spacing: { after: 200 } }));
        sections.push(...signatureBlock);
    }
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Georgia',
                        size: 20, // 🔧 Reduced from 28 to ~11pt
                    },
                    paragraph: {
                        spacing: { after: 100 },
                    },
                },
            },
        },
        sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,
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
