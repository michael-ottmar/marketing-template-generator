// lib/excelGenerator.js
// Generates Excel files with Copy and Requirements tabs

import ExcelJS from 'exceljs';

export async function generateExcelFile(config) {
  const { deliverables, markets, projectName, contentRows, leadLanguage } = config;

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Marketing Template Generator';
  workbook.created = new Date();

  // Tab 1: Copy Template
  const copySheet = workbook.addWorksheet('Copy Template');
  await generateCopyTab(copySheet, deliverables, markets, contentRows, leadLanguage);

  // Tab 2: Asset Requirements
  const requirementsSheet = workbook.addWorksheet('Asset Requirements');
  await generateRequirementsTab(requirementsSheet, deliverables);

  // Generate buffer and return as Blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function generateCopyTab(worksheet, deliverables, markets, contentRows, leadLanguage) {
  // Sort markets: lead language first, then alphabetically by code
  const sortedMarkets = [...markets].sort((a, b) => {
    // Lead language always comes first
    if (leadLanguage) {
      if (a.code === leadLanguage) return -1;
      if (b.code === leadLanguage) return 1;
    }
    // Then sort alphabetically
    return a.code.localeCompare(b.code);
  });

  // Row 1: Market codes (e.g., en-US, es-MX)
  const row1 = worksheet.addRow(['Deliverable', 'Name', ...sortedMarkets.map(m => m.code)]);

  // Row 2: Language names (e.g., English, Spanish)
  const row2 = worksheet.addRow(['Deliverable', 'Name', ...sortedMarkets.map(m => {
    // Extract language from "English (United States)" -> "English"
    const match = m.name.match(/^([^(]+)/);
    return match ? match[1].trim() : m.code.split('-')[0];
  })]);

  // Row 3: Region names (e.g., United States, Mexico)
  const row3 = worksheet.addRow(['Deliverable', 'Name', ...sortedMarkets.map(m => {
    // Extract region from "English (United States)" -> "United States"
    const match = m.name.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : m.region || '';
  })]);

  // Style the 3 header rows
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  };

  [row1, row2, row3].forEach(row => {
    row.eachCell((cell) => {
      cell.style = headerStyle;
    });
    row.height = 20;
  });

  // Data rows
  deliverables.forEach(deliverable => {
    deliverable.sections.forEach(section => {
      section.fields.forEach(field => {
        let rowData;

        if (contentRows) {
          // Find matching content row
          const contentRow = contentRows.find(
            cr => cr.deliverable === section.name && cr.field === field
          );

          if (contentRow) {
            // Use actual content from Word files
            rowData = [
              section.name,
              field,
              ...sortedMarkets.map(m => contentRow.content[m.code] || `[${m.code} translation needed]`)
            ];
          } else {
            // Fallback to placeholder
            rowData = [
              section.name,
              field,
              ...sortedMarkets.map(m => `[${m.code} translation needed]`)
            ];
          }
        } else {
          // No content provided - use placeholders
          rowData = [
            section.name,
            field,
            ...sortedMarkets.map(m => `[${m.code} translation needed]`)
          ];
        }

        worksheet.addRow(rowData);
      });
    });
  });

  // Set column widths
  worksheet.getColumn(1).width = 25; // Deliverable
  worksheet.getColumn(2).width = 20; // Name
  for (let i = 3; i <= sortedMarkets.length + 2; i++) {
    worksheet.getColumn(i).width = 35; // Language columns
  }

  // Freeze panes: First 3 rows (header) + first 3 columns (Deliverable, Name, Lead Language)
  worksheet.views = [
    { state: 'frozen', xSplit: 3, ySplit: 3 }
  ];
}

async function generateRequirementsTab(worksheet, deliverables) {
  // Header row
  const headers = [
    'Deliverable',
    'Asset Name',
    'Width (px)',
    'Height (px)',
    'Max File Size',
    'Formats',
    'Filename Format',
    'Notes'
  ];

  const headerRow = worksheet.addRow(headers);

  // Style header
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  };

  headerRow.eachCell((cell) => {
    cell.style = headerStyle;
  });
  headerRow.height = 20;

  // Data rows
  deliverables.forEach(deliverable => {
    if (!deliverable.assets || deliverable.assets.length === 0) return;

    deliverable.assets.forEach(asset => {
      worksheet.addRow([
        deliverable.name,
        asset.name,
        asset.width,
        asset.height,
        `${asset.maxFileSizeMB} MB`,
        asset.formats.join(', '),
        asset.filenameFormat,
        asset.notes || ''
      ]);
    });
  });

  // Set column widths
  worksheet.getColumn(1).width = 25; // Deliverable
  worksheet.getColumn(2).width = 30; // Asset Name
  worksheet.getColumn(3).width = 12; // Width
  worksheet.getColumn(4).width = 12; // Height
  worksheet.getColumn(5).width = 15; // Max File Size
  worksheet.getColumn(6).width = 15; // Formats
  worksheet.getColumn(7).width = 40; // Filename Format
  worksheet.getColumn(8).width = 30; // Notes
}
