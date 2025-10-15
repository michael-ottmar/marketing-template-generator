// lib/wordGenerator.js
// Generates Word documents for copywriters

import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';

export function generateWordDocument(deliverable, market, projectName) {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: 'Product Detail Page - Marketing Copy Template',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        // Project name
        new Paragraph({
          children: [
            new TextRun({
              text: `Project: ${projectName}`,
              bold: true,
              size: 24
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),

        // Language subtitle
        new Paragraph({
          children: [
            new TextRun({
              text: `Language: ${market.name} (${market.code})`,
              bold: true,
              size: 28
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),

        // Date
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated: ${formattedDate}`,
              size: 22,
              color: '666666'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Instructions
        new Paragraph({
          children: [
            new TextRun({
              text: 'Instructions: Fill in the localized copy for each section below. Use the section headers to organize your content. This document will be converted to a localization spreadsheet once complete.',
              italics: true,
              size: 20,
              color: '808080'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Generate content sections
        ...generateSections(deliverable),

        // Footer metadata
        new Paragraph({
          text: '─'.repeat(80),
          spacing: { before: 400, after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: `Template Version: 1.0 | Language: ${market.code} | Date: ${formattedDate}\nNote: This document follows a structured format for easy conversion to localization spreadsheets.`,
              size: 16,
              italics: true,
              color: '808080'
            })
          ]
        })
      ]
    }]
  });

  return doc;
}

function generateSections(deliverable) {
  const paragraphs = [];

  deliverable.sections.forEach((section, index) => {
    // Detect deliverable name from section naming pattern
    // Sections are named like "Gallery 1", "Gallery 2", "Hero Banner", etc.
    // We'll add a visual separator for major section transitions
    const isNewDeliverable = index === 0 ||
      (index > 0 && !section.name.match(/\d+$/) && !deliverable.sections[index - 1].name.match(/\d+$/));

    // Add a decorative section break for major deliverables
    if (index > 0 && isNewDeliverable) {
      paragraphs.push(
        new Paragraph({
          text: '',
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          text: '═'.repeat(80),
          spacing: { before: 200, after: 200 },
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: '',
          spacing: { before: 200, after: 200 }
        })
      );
    }

    // Section heading with enhanced styling
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.name,
            bold: true,
            size: 32,
            color: '2E5090'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
        border: {
          bottom: {
            color: '2E5090',
            space: 1,
            style: 'single',
            size: 6
          }
        }
      })
    );

    // Fields in the section
    section.fields.forEach(field => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${field}: `,
              bold: true,
              size: 22
            }),
            new TextRun({
              text: `[${field} translation needed]`,
              size: 22
            })
          ],
          spacing: { after: 120 }
        })
      );
    });

    // Spacing between sections
    paragraphs.push(new Paragraph({ text: '' }));
  });

  return paragraphs;
}

// Helper to convert Document to Blob for download
export async function documentToBlob(doc) {
  const Packer = (await import('docx')).Packer;
  const blob = await Packer.toBlob(doc);
  return blob;
}
