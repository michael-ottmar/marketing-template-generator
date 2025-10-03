# 🚀 Quick Reference for Claude Code

## Start Here
1. Read: `.claude/README.md` (this directory overview)
2. Read: `.claude/phase-2-master-plan.md` (architecture)
3. Choose implementation path below

## Implementation Paths

### Path A: Word → Excel First (Recommended)
**Goal:** Let users import completed Word docs back to Excel

**Steps:**
1. Read `.claude/word-parser-guide.md` ← FULL IMPLEMENTATION
2. Read `.claude/component-specs.md` (FileDropZone, PreviewTable)
3. Build `/app/import/page.js` with Word→Excel tab
4. Test with files from Phase 1

**Estimated Time:** 3-4 days

### Path B: Excel → Word First
**Goal:** Let users convert Excel templates to Word docs

**Steps:**
1. Read `.claude/excel-parser-guide.md` ← FULL IMPLEMENTATION
2. Read `.claude/component-specs.md` (FileDropZone, PreviewTable)
3. Reuse existing wordGenerator.js from Phase 1
4. Build `/app/import/page.js` with Excel→Word tab

**Estimated Time:** 2-3 days

### Path C: QA Assistant (After A or B)
**Goal:** Add Claude API powered copy review

**Steps:**
1. Read `.claude/qa-engine-guide.md` ← FULL IMPLEMENTATION
2. Read `.claude/component-specs.md` (QAAssistant, QAResultsPanel)
3. Create `/app/api/qa/route.js` server endpoint
4. Get Anthropic API key from console.anthropic.com
5. Set environment variable in Vercel

**Estimated Time:** 3-5 days

## File Locations

### Documents to Read
```
.claude/
├── README.md                    ← Overview (read first)
├── phase-2-master-plan.md       ← Architecture (read second)
├── word-parser-guide.md         ← Word parsing (Path A)
├── excel-parser-guide.md        ← Excel parsing (Path B)
├── qa-engine-guide.md           ← Claude API (Path C)
└── component-specs.md           ← UI components (all paths)
```

### Files to Create
```
lib/
├── wordParser.js                ← NEW: Word parsing logic
├── excelParser.js               ← NEW: Excel parsing logic
└── qaEngine.js                  ← NEW: (optional) QA client wrapper

components/
├── FileDropZone.js              ← NEW: Drag & drop
├── PreviewTable.js              ← NEW: Show parsed data
├── QAAssistant.js               ← NEW: Chat interface
└── QAResultsPanel.js            ← NEW: Show QA issues

app/import/
└── page.js                      ← NEW: Main import UI

app/api/qa/
└── route.js                     ← NEW: Server endpoint for Claude API
```

## Commands

### Install New Dependencies
```bash
npm install mammoth @anthropic-ai/sdk
```

### Run Development Server
```bash
npm run dev
```

### Test Your Changes
```bash
# Generate files in Phase 1
# Download them
# Try to import them in Phase 2
```

## Key Concepts

### Word Parsing Strategy
1. Use `mammoth` to extract HTML structure
2. Parse H1 tags = Section names (Deliverable)
3. Parse "FieldName: content" pattern
4. Detect market from filename (e.g., _en-US.docx)
5. Fuzzy match field names to catalog

### Excel Parsing Strategy
1. Use `xlsx` (already installed) 
2. Read Tab 1: Copy Template
3. First 2 columns: Deliverable, Name
4. Remaining columns: Market codes
5. Read Tab 2: Asset Requirements (optional)

### Claude API Strategy
1. Server-side ONLY (protect API key)
2. Batch requests (50 fields per call)
3. Stream chat responses
4. Show cost estimate before running
5. Implement rate limiting

## Decision Points

### Q: Should we start with Word→Excel or Excel→Word?
**A:** Word→Excel is more valuable (completes workflow)

### Q: Do we need QA for MVP?
**A:** No, but it's the "wow factor" feature. Do parsers first.

### Q: Client-side or server-side parsing?
**A:** Client-side for files, server-side for Claude API only

### Q: How to handle fuzzy field matching?
**A:** Show confidence scores, let user confirm/override

## Common Issues

### Issue: "mammoth is not defined"
**Fix:** `npm install mammoth`

### Issue: "Can't parse Word document"
**Fix:** Check that file is actually .docx (not .doc or corrupted)

### Issue: "Claude API key not found"
**Fix:** Set ANTHROPIC_API_KEY in Vercel environment variables

### Issue: "Rate limit exceeded"
**Fix:** Implement rate limiting in /app/api/qa/route.js

### Issue: "Preview table is empty"
**Fix:** Console.log parsed data, check structure matches expected format

## Testing Checklist

For Word Parser:
- [ ] Parse Phase 1 generated Word doc (should be perfect)
- [ ] Parse manually edited Word doc (test fuzzy matching)
- [ ] Parse doc with missing sections
- [ ] Parse doc with extra sections
- [ ] Multiple docs at once

For Excel Parser:
- [ ] Parse Phase 1 generated Excel (should be perfect)
- [ ] Parse Excel with reordered columns
- [ ] Parse Excel with missing Tab 2
- [ ] Parse Excel with empty cells
- [ ] Parse Excel with unknown markets

For QA:
- [ ] Batch check returns valid JSON
- [ ] Chat streams correctly
- [ ] Rate limiting works
- [ ] Cost estimation accurate
- [ ] API key never exposed to client

## Next Steps After Implementation

1. Push to GitHub
2. Vercel auto-deploys
3. Test on live site
4. Get user feedback
5. Iterate based on real usage

## Questions?

All answers should be in the 5 main guide files:
1. phase-2-master-plan.md - Architecture decisions
2. word-parser-guide.md - Word parsing details
3. excel-parser-guide.md - Excel parsing details  
4. qa-engine-guide.md - Claude API details
5. component-specs.md - UI component details

---

**TIP:** Don't try to implement everything at once. Get one parser working end-to-end first!

Good luck! 🚀
