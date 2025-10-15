// lib/excelParser.js
import * as XLSX from 'xlsx';
import marketsData from '@/data/markets.json';

export async function parseExcelFile(file) {
  try {
    // Step 1: Read file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const warnings = [];

    // Step 2: Find Copy Template tab
    let copyTab = workbook.Sheets['Copy Template'];
    if (!copyTab) {
      // Try to find it by index (first sheet)
      copyTab = workbook.Sheets[workbook.SheetNames[0]];
      warnings.push('Copy Template tab not found by name, using first sheet');
    }

    if (!copyTab) {
      throw new Error('No valid sheets found in Excel file');
    }

    // Step 3: Parse Copy Template
    const { markets, rows } = parseCopyTab(copyTab);

    // Step 4: Validate markets
    const marketWarnings = validateMarkets(markets, marketsData.markets);
    warnings.push(...marketWarnings);

    // Step 5: Parse Requirements tab (if exists)
    let requirements = [];
    const requirementsTab = workbook.Sheets['Asset Requirements'];
    if (requirementsTab) {
      requirements = parseRequirementsTab(requirementsTab);
    } else {
      warnings.push('Asset Requirements tab not found (optional)');
    }

    // Step 6: Group data
    const grouped = groupRowsByDeliverable(rows);

    // Step 7: Extract project name from filename
    // Expected format: ProjectName_Localization_Template_YYYY-MM-DD.xlsx
    let projectName = 'Imported_Project';
    const filenameMatch = file.name.match(/^(.+?)_Localization_Template/);
    if (filenameMatch) {
      projectName = filenameMatch[1];
    } else {
      // Try to extract anything before .xlsx
      const baseMatch = file.name.match(/^(.+?)\.xlsx$/i);
      if (baseMatch) {
        projectName = baseMatch[1];
      }
    }

    return {
      markets,
      rows,
      grouped,
      requirements,
      projectName,
      metadata: {
        filename: file.name,
        tabNames: workbook.SheetNames,
        parsedAt: new Date(),
        warnings
      }
    };

  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse ${file.name}: ${error.message}`);
  }
}

// Helper: Parse Copy Template tab
function parseCopyTab(worksheet) {
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false  // Skip completely blank rows
  });

  if (data.length === 0) {
    throw new Error('Copy Template tab is empty');
  }

  const headers = data[0];

  // Validate structure
  if (!headers[0] || !headers[1]) {
    throw new Error('Invalid Excel structure. First two columns must be Deliverable and Name');
  }

  // Extract market codes (all columns after position 1)
  const markets = headers.slice(2).filter(h => h); // Filter out empty headers

  if (markets.length === 0) {
    throw new Error('No market columns found in Excel file');
  }

  // Parse data rows
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip if both deliverable and field are empty
    if (!row[0] && !row[1]) continue;

    if (!row[0] || !row[1]) {
      console.warn(`Row ${i + 1} has missing deliverable or field name, skipping`);
      continue;
    }

    const content = {};
    markets.forEach((market, idx) => {
      content[market] = row[idx + 2] || '';
    });

    rows.push({
      deliverable: String(row[0]).trim(),
      field: String(row[1]).trim(),
      content
    });
  }

  return { markets, rows };
}

// Helper: Parse Requirements tab
function parseRequirementsTab(worksheet) {
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false
  });

  if (data.length <= 1) return []; // Only header or empty

  const requirements = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (!row[0]) continue;

    requirements.push({
      deliverable: row[0] || '',
      assetName: row[1] || '',
      width: row[2] || null,
      height: row[3] || null,
      maxFileSize: row[4] || '',
      formats: row[5] || '',
      filenameFormat: row[6] || '',
      notes: row[7] || ''
    });
  }

  return requirements;
}

// Helper: Group rows by deliverable
function groupRowsByDeliverable(rows) {
  const grouped = {};

  rows.forEach(row => {
    if (!grouped[row.deliverable]) {
      grouped[row.deliverable] = {
        name: row.deliverable,
        fields: []
      };
    }

    grouped[row.deliverable].fields.push({
      name: row.field,
      content: row.content
    });
  });

  return grouped;
}

// Helper: Validate markets
function validateMarkets(markets, knownMarkets) {
  const warnings = [];

  markets.forEach(market => {
    const isKnown = knownMarkets.some(m => m.code === market);
    if (!isKnown) {
      warnings.push(`Unknown market code: "${market}" - may not be in standard list`);
    }
  });

  return warnings;
}

// Helper: Get content for specific market
export function getMarketContent(parsedData, marketCode) {
  return parsedData.rows.map(row => ({
    deliverable: row.deliverable,
    field: row.field,
    content: row.content[marketCode] || ''
  }));
}

// Helper: Check if content is complete
export function validateCompleteness(parsedData) {
  const issues = [];

  parsedData.rows.forEach((row, index) => {
    parsedData.markets.forEach(market => {
      const content = row.content[market];

      // Check for placeholder text
      if (content && content.includes('[') && content.includes('translation needed')) {
        issues.push({
          row: index + 2, // +2 for header row and 0-index
          deliverable: row.deliverable,
          field: row.field,
          market,
          issue: 'Contains placeholder text'
        });
      }

      // Check for empty required fields
      if (!content || content.trim() === '') {
        issues.push({
          row: index + 2,
          deliverable: row.deliverable,
          field: row.field,
          market,
          issue: 'Empty content'
        });
      }
    });
  });

  return issues;
}
