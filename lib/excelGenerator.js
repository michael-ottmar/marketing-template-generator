// lib/excelGenerator.js
// Generates Excel files with Copy and Requirements tabs

import * as XLSX from 'xlsx';

export function generateExcelFile(config) {
  const { deliverables, markets, projectName, contentRows } = config;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Tab 1: Copy Template
  const copyData = generateCopyTab(deliverables, markets, contentRows);
  const copySheet = XLSX.utils.aoa_to_sheet(copyData);
  
  // Style the 3 header rows
  const range = XLSX.utils.decode_range(copySheet['!ref']);
  for (let row = 0; row < 3; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!copySheet[cellAddress]) continue;

      copySheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  }
  
  // Set column widths
  copySheet['!cols'] = [
    { wch: 20 }, // Deliverable
    { wch: 20 }, // Name
    ...markets.map(() => ({ wch: 35 })) // Language columns
  ];
  
  // Freeze panes (3 header rows + first 2 columns)
  copySheet['!freeze'] = { xSplit: 2, ySplit: 3 };
  
  XLSX.utils.book_append_sheet(wb, copySheet, 'Copy Template');
  
  // Tab 2: Asset Requirements
  const requirementsData = generateRequirementsTab(deliverables);
  const requirementsSheet = XLSX.utils.aoa_to_sheet(requirementsData);
  
  // Style requirements header
  const reqRange = XLSX.utils.decode_range(requirementsSheet['!ref']);
  for (let col = reqRange.s.c; col <= reqRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!requirementsSheet[cellAddress]) continue;
    
    requirementsSheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "70AD47" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
  
  // Set requirements column widths
  requirementsSheet['!cols'] = [
    { wch: 25 }, // Deliverable
    { wch: 30 }, // Asset Name
    { wch: 12 }, // Width
    { wch: 12 }, // Height
    { wch: 15 }, // Max File Size
    { wch: 15 }, // Formats
    { wch: 40 }, // Filename Format
    { wch: 30 }  // Notes
  ];
  
  XLSX.utils.book_append_sheet(wb, requirementsSheet, 'Asset Requirements');
  
  // Generate file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function generateCopyTab(deliverables, markets, contentRows) {
  // Sort markets alphabetically by code
  const sortedMarkets = [...markets].sort((a, b) => a.code.localeCompare(b.code));

  // Row 1: Market codes (e.g., en-US, es-MX)
  const row1 = ['Deliverable', 'Name', ...sortedMarkets.map(m => m.code)];

  // Row 2: Language names (e.g., English, Spanish)
  const row2 = ['Deliverable', 'Name', ...sortedMarkets.map(m => {
    // Extract language from "English (United States)" -> "English"
    const match = m.name.match(/^([^(]+)/);
    return match ? match[1].trim() : m.code.split('-')[0];
  })];

  // Row 3: Region names (e.g., United States, Mexico)
  const row3 = ['Deliverable', 'Name', ...sortedMarkets.map(m => {
    // Extract region from "English (United States)" -> "United States"
    const match = m.name.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : m.region || '';
  })];

  const rows = [row1, row2, row3];

  // Data rows
  deliverables.forEach(deliverable => {
    deliverable.sections.forEach(section => {
      section.fields.forEach(field => {
        // Check if we have actual content from imported Word files
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

        rows.push(rowData);
      });
    });
  });

  return rows;
}

function generateRequirementsTab(deliverables) {
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
  const rows = [headers];
  
  // Data rows
  deliverables.forEach(deliverable => {
    if (!deliverable.assets || deliverable.assets.length === 0) return;
    
    deliverable.assets.forEach(asset => {
      const row = [
        deliverable.name,
        asset.name,
        asset.width,
        asset.height,
        `${asset.maxFileSizeMB} MB`,
        asset.formats.join(', '),
        asset.filenameFormat,
        asset.notes || ''
      ];
      rows.push(row);
    });
  });
  
  return rows;
}
