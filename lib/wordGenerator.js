// lib/wordGenerator.js
// Generates Word documents for copywriters

import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export function generateWordDocument(deliverable, market) {
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
              text: `Template Version: 1.0 | Language: ${market.code} | Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\nNote: This document follows a structured format for easy conversion to localization spreadsheets.`,
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
  
  deliverable.sections.forEach(section => {
    // Section heading
    paragraphs.push(
      new Paragraph({
        text: section.name,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 }
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
