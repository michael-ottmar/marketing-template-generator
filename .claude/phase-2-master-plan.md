# Phase 2: Import & QA System - Master Plan

## 🎯 Overview

This document outlines the architecture for Phase 2 of the Marketing Template Generator: bidirectional Word ↔ Excel conversion and Claude API-powered QA assistant.

## 📐 Architecture Summary

### Three Main Features:
1. **Word → Excel Conversion** - Parse completed Word docs, generate Excel
2. **Excel → Word Conversion** - Parse Excel template, generate Word docs
3. **QA Assistant** - Claude API analyzes copy for issues, chat interface

### User Flow:
```
/app/import (new page)
├─ Tab 1: Word → Excel
├─ Tab 2: Excel → Word  
└─ Tab 3: QA Assistant (works on either input)
```

## 🏗️ New File Structure

```
/app/import/
  page.js                    # Main import interface with tabs
  
/components/
  FileDropZone.js            # Drag & drop for files
  PreviewTable.js            # Shows parsed data before conversion
  QAAssistant.js             # Chat interface for QA
  QAResultsPanel.js          # Shows auto-detected issues
  ConversionModeSelector.js  # Toggle Word→Excel or Excel→Word
  
/lib/
  wordParser.js              # Parse .docx → structured data
  excelParser.js             # Parse .xlsx → structured data
  conversionHelpers.js       # Data transformation utilities
  qaEngine.js                # Claude API integration logic
  
/app/api/qa/
  route.js                   # Server endpoint for Claude API calls
```

## 🔄 Data Flow

### Word → Excel:
```
1. User drops Word files
2. wordParser.js extracts structure
3. PreviewTable shows parsed data
4. User confirms or edits
5. excelGenerator.js creates Excel
6. Download
```

### Excel → Word:
```
1. User drops Excel file
2. excelParser.js extracts data
3. PreviewTable shows what will be generated
4. User confirms
5. wordGenerator.js creates docs for each market
6. ZIP download
```

### QA Flow:
```
1. User has imported files (Word or Excel)
2. Clicks "Run QA Check"
3. qaEngine.js batches content → Claude API
4. QAResultsPanel shows issues
5. User can chat with Claude for specific questions
6. Export corrected files or QA report
```

## 🚀 Implementation Order

### Sprint 1: Import Infrastructure
1. Create `/app/import/page.js` with tab structure
2. Build `FileDropZone` component
3. Implement `wordParser.js` (most complex)
4. Implement `excelParser.js`
5. Build `PreviewTable` component
6. Test full round-trip

### Sprint 2: QA System
1. Create `/app/api/qa/route.js` for Claude API
2. Build `qaEngine.js` with batch review
3. Create `QAResultsPanel` component
4. Build `QAAssistant` chat component
5. Test API costs and rate limits

### Sprint 3: Polish
1. Error handling and edge cases
2. Field name fuzzy matching
3. Custom glossary support
4. Export QA reports

## 📋 Key Technical Decisions

### 1. Parsing Strategy
- **Client-side parsing** for Word/Excel (privacy, no backend)
- **Server-side Claude API** (protect API key)
- Use `docx` npm package for Word parsing
- Use `xlsx` (already imported) for Excel parsing

### 2. Schema Flexibility
- Allow fuzzy field name matching (Headline = Title = Header)
- Show confidence scores
- Let users confirm/override mappings

### 3. QA Scope
- Start with basic automated checks
- Add chat interface for custom queries
- Context-aware (Claude sees all project copy)

## 🔗 Related Documents

- [Word Parser Implementation Guide](./word-parser-guide.md)
- [Excel Parser Implementation Guide](./excel-parser-guide.md)
- [QA Engine Implementation Guide](./qa-engine-guide.md)
- [Component Specifications](./component-specs.md)

## 💡 Notes for Claude Code

- All new code should follow existing patterns from Phase 1
- Reuse components where possible (buttons, layouts)
- Keep client-side generation philosophy (no backend for file processing)
- Claude API calls MUST be server-side only
- Test with real files from Phase 1 generation

## ⚠️ Critical Considerations

1. **File Size Limits** - Vercel has upload limits, document in UI
2. **API Costs** - Show estimated cost before running QA
3. **Rate Limiting** - Respect Claude API rate limits (batch smartly)
4. **Error Handling** - Graceful failures for malformed files
5. **Progress Indicators** - Long operations need loading states

## 📞 Questions to Resolve

- [ ] What's max file size we should support?
- [ ] Claude API budget per project?
- [ ] Should QA be free-tier or paid feature?
- [ ] Custom glossary upload needed for MVP?

---

**Status:** Planning Complete ✅
**Next Step:** Read word-parser-guide.md and start implementation
