// lib/excelGenerator.js
// Generates Excel files with Copy and Requirements tabs

import * as XLSX from 'xlsx';

export function generateExcelFile(config) {
  const { deliverables, markets, projectName } = config;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Tab 1: Copy Template
  const copyData = generateCopyTab(deliverables, markets);
  const copySheet = XLSX.utils.aoa_to_sheet(copyData);
  
  // Style the header row
  const range = XLSX.utils.decode_range(copySheet['!ref']);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!copySheet[cellAddress]) continue;
    
    copySheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
  
  // Set column widths
  copySheet['!cols'] = [
    { wch: 20 }, // Deliverable
    { wch: 20 }, // Name
    ...markets.map(() => ({ wch: 35 })) // Language columns
  ];
  
  // Freeze panes (header + first 2 columns)
  copySheet['!freeze'] = { xSplit: 2, ySplit: 1 };
  
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

function generateCopyTab(deliverables, markets) {
  // Header row
  const headers = ['Deliverable', 'Name', ...markets.map(m => m.code)];
  const rows = [headers];
  
  // Data rows
  deliverables.forEach(deliverable => {
    deliverable.sections.forEach(section => {
      section.fields.forEach(field => {
        const row = [
          section.name,
          field,
          `[${markets[0].code} translation needed]`, // First market gets placeholder
          ...markets.slice(1).map(m => `[${m.code} translation needed]`)
        ];
        rows.push(row);
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
