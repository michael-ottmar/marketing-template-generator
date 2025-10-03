// lib/wordParser.js
import mammoth from 'mammoth';
import deliverables from '@/data/deliverables.json';

export async function parseWordDocument(file) {
  try {
    // Step 1: Extract structure
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    // Step 2: Parse HTML
    const sections = parseHTML(result.value);

    // Step 3: Detect market
    const market = detectMarket(file.name);

    // Step 4: Validate field names
    const validatedSections = validateFieldNames(sections);

    // Step 5: Compile warnings
    const warnings = [];

    validatedSections.forEach(section => {
      section.fields.forEach(field => {
        if (field.confidence < 0.8) {
          warnings.push(
            `Low confidence match: "${field.originalName}" → "${field.name}" (${Math.round(field.confidence * 100)}%)`
          );
        }
      });
    });

    return {
      market,
      sections: validatedSections,
      metadata: {
        filename: file.name,
        parsedAt: new Date(),
        warnings
      }
    };

  } catch (error) {
    console.error('Error parsing Word document:', error);
    throw new Error(`Failed to parse ${file.name}: ${error.message}`);
  }
}

// Helper: Parse HTML structure
function parseHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const sections = [];
  let currentSection = null;

  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  let node;
  while (node = walker.nextNode()) {
    if (node.tagName === 'H1') {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        deliverable: node.textContent.trim(),
        fields: []
      };
    }
    else if (node.tagName === 'P' && currentSection) {
      const text = node.textContent;
      const match = text.match(/^(.+?):\s*(.*)$/);

      if (match && match[1] && match[2]) {
        currentSection.fields.push({
          name: match[1].trim(),
          content: match[2].trim(),
          confidence: 1.0
        });
      }
    }
  }

  if (currentSection) sections.push(currentSection);

  return sections;
}

// Helper: Detect market from filename
function detectMarket(filename) {
  const marketMatch = filename.match(/_([a-z]{2}-[A-Z]{2})\.docx$/i);
  return marketMatch ? marketMatch[1] : 'unknown';
}

// Helper: Fuzzy field matching
function fuzzyMatchField(fieldName, expectedFields) {
  if (expectedFields.includes(fieldName)) {
    return { match: fieldName, confidence: 1.0 };
  }

  const normalized = fieldName.toLowerCase().trim();
  const normalizedExpected = expectedFields.map(f => f.toLowerCase().trim());

  const exactIndex = normalizedExpected.indexOf(normalized);
  if (exactIndex !== -1) {
    return { match: expectedFields[exactIndex], confidence: 0.95 };
  }

  const variations = {
    'headline': ['title', 'header', 'heading'],
    'body': ['description', 'copy', 'text', 'content'],
    'cta': ['button', 'call to action', 'action'],
    'legal': ['disclaimer', 'fine print', 'terms']
  };

  for (const [standard, alts] of Object.entries(variations)) {
    if (alts.includes(normalized) && expectedFields.includes(standard)) {
      return { match: standard, confidence: 0.8 };
    }
  }

  return { match: fieldName, confidence: 0.0 };
}

// Helper: Validate field names
function validateFieldNames(sections) {
  const catalog = Object.values(deliverables);

  sections.forEach(section => {
    const deliverable = catalog.find(d =>
      d.sections?.some(s => s.name === section.deliverable)
    );

    if (deliverable) {
      const expectedSection = deliverable.sections.find(s =>
        s.name === section.deliverable
      );

      if (expectedSection) {
        section.fields = section.fields.map(field => {
          const { match, confidence } = fuzzyMatchField(
            field.name,
            expectedSection.fields
          );

          return {
            ...field,
            originalName: field.name !== match ? field.name : undefined,
            name: match,
            confidence
          };
        });
      }
    }
  });

  return sections;
}

// Batch parse multiple Word documents
export async function parseMultipleWordDocuments(files) {
  const results = await Promise.allSettled(
    files.map(file => parseWordDocument(file))
  );

  const parsed = [];
  const errors = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      parsed.push(result.value);
    } else {
      errors.push({
        filename: files[index].name,
        error: result.reason.message
      });
    }
  });

  return { parsed, errors };
}
