// lib/wordGenerator.js
// Generates Word documents for copywriters

import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

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
          text: 'Marketing Copy Template',
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

  deliverable.sections.forEach((section, sectionIndex) => {
    // Add spacing before each major deliverable section (except first)
    if (sectionIndex > 0) {
      paragraphs.push(
        new Paragraph({
          text: '',
          spacing: { before: 400, after: 200 }
        })
      );
    }

    // Major section header (e.g., "Product Detail Page - Above the Fold", "Display Ads")
    // Large, bold, blue - like a title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.name,
            bold: true,
            size: 40, // Large title size
            color: '2E5090' // Blue
          })
        ],
        spacing: { before: 300, after: 300 }
      })
    );

    // Check if section has subsections (new nested structure)
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        // Subsection heading (e.g., "Product Description", "Gallery 1", "300x250 Ad")
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: subsection.name,
                bold: true,
                size: 28,
                color: '2E5090'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 250, after: 150 },
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

        // Fields in the subsection
        subsection.fields.forEach(field => {
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

        // Spacing between subsections
        paragraphs.push(new Paragraph({ text: '' }));
      });
    } else {
      // Fallback for old flat structure (fields directly on section)
      if (section.fields) {
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
        paragraphs.push(new Paragraph({ text: '' }));
      }
    }
  });

  return paragraphs;
}

// Helper to convert Document to Blob for download
export async function documentToBlob(doc) {
  const Packer = (await import('docx')).Packer;
  const blob = await Packer.toBlob(doc);
  return blob;
}
