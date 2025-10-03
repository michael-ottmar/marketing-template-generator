# README: Phase 2 Implementation Guide

## 📖 Overview

This `.claude` directory contains comprehensive documentation for implementing **Phase 2** of the Marketing Template Generator: **Import & QA System**.

## 📚 Document Index

### 1. **phase-2-master-plan.md** ⭐ START HERE
- High-level architecture overview
- Feature specifications
- Implementation roadmap
- Decision points and priorities

### 2. **word-parser-guide.md**
- Complete implementation of Word document parsing
- Handles `.docx` files → structured data
- Fuzzy field name matching
- Edge cases and validation
- **Complexity:** High - Start here for parsing work

### 3. **excel-parser-guide.md**
- Complete implementation of Excel parsing
- Handles `.xlsx` files → structured data
- Multi-tab support (Copy + Requirements)
- Market detection and validation
- **Complexity:** Medium - Easier than Word parsing

### 4. **component-specs.md**
- React component specifications
- FileDropZone (drag & drop)
- PreviewTable (show parsed data)
- QAAssistant (chat interface)
- QAResultsPanel (show issues)
- **Complexity:** Medium - Standard React patterns

### 5. **qa-engine-guide.md**
- Claude API integration
- Server-side route setup
- Batch QA checks
- Interactive chat
- Cost management
- Security best practices
- **Complexity:** Medium-High - Requires API key

## 🎯 Recommended Implementation Order

### Week 1: Core Parsing & Preview
```
Day 1-2: Set up /app/import page structure
Day 3-4: Build FileDropZone component
Day 5: Implement wordParser.js (HARDEST PART)
Day 6: Implement excelParser.js
Day 7: Build PreviewTable component + test full flow
```

### Week 2: QA System
```
Day 1-2: Create /app/api/qa/route.js
Day 3: Build QAResultsPanel component
Day 4-5: Build QAAssistant chat component
Day 6: Integration testing
Day 7: Cost optimization & rate limiting
```

### Week 3: Polish & Edge Cases
```
Day 1-2: Handle edge cases from testing
Day 3: Add fuzzy field matching
Day 4: Export features (QA reports, CSV)
Day 5: Performance optimization
Day 6-7: User testing & fixes
```

## 🚀 Quick Start for Claude Code

### Step 1: Read Master Plan
```bash
# Claude Code: Read this first
cat .claude/phase-2-master-plan.md
```

### Step 2: Install New Dependencies
```bash
npm install mammoth @anthropic-ai/sdk
```

### Step 3: Start with FileDropZone
```bash
# Claude Code: Create this component first (it's reusable)
# Spec: .claude/component-specs.md (FileDropZone section)
touch components/FileDropZone.js
```

### Step 4: Implement Word Parser
```bash
# Claude Code: This is the most complex part
# Full implementation guide: .claude/word-parser-guide.md
touch lib/wordParser.js
```

### Step 5: Create Import Page
```bash
# Claude Code: Main UI for Phase 2
mkdir -p app/import
touch app/import/page.js
```

## 📋 Checklists

### Before Starting
- [ ] Read phase-2-master-plan.md completely
- [ ] Understand Phase 1 codebase (existing patterns)
- [ ] Install new dependencies (mammoth, @anthropic-ai/sdk)
- [ ] Get Anthropic API key (for QA features)
- [ ] Set up .env.local with API key

### During Implementation
- [ ] Follow existing code style from Phase 1
- [ ] Reuse components where possible
- [ ] Test each parser with real files
- [ ] Handle errors gracefully
- [ ] Add loading states for all async operations

### Before Push
- [ ] All parsers tested with Phase 1 generated files
- [ ] All parsers tested with manually edited files
- [ ] Edge cases handled (missing data, malformed files)
- [ ] API route secured (key not exposed)
- [ ] Rate limiting implemented
- [ ] User-friendly error messages

## 🎨 Architecture Principles

### 1. Consistency with Phase 1
- Use same design patterns
- Match existing UI/UX
- Reuse components (buttons, layouts)
- Same file structure conventions

### 2. Client-Side First
- Parse files in browser (privacy, cost)
- Only Claude API calls go to server
- No backend for file processing

### 3. Progressive Enhancement
- Core features work without QA
- QA is optional enhancement
- Graceful degradation for errors

### 4. Developer Experience
- Clear error messages
- Console logging for debugging
- TypeScript types (optional but helpful)
- Comprehensive tests

## 🐛 Common Pitfalls

### 1. Word Parsing
❌ **DON'T** assume perfect formatting
✅ **DO** handle variations (Title vs Headline)

❌ **DON'T** fail on unexpected content
✅ **DO** warn user and continue

### 2. Excel Parsing
❌ **DON'T** assume columns are in order
✅ **DO** find columns by header name

❌ **DON'T** break on merged cells
✅ **DO** detect and warn user

### 3. Claude API
❌ **DON'T** expose API key client-side
✅ **DO** use server route

❌ **DON'T** send unlimited requests
✅ **DO** implement rate limiting

❌ **DON'T** assume JSON response is valid
✅ **DO** parse carefully with try-catch

### 4. UI/UX
❌ **DON'T** block UI during parsing
✅ **DO** show progress indicators

❌ **DON'T** fail silently
✅ **DO** show actionable error messages

## 📞 Questions?

If implementation details are unclear:
1. Check if answer is in one of the 5 guides
2. Look at existing Phase 1 code for patterns
3. Test with real files early and often

## 🔗 External Resources

- [mammoth.js docs](https://github.com/mwilliamson/mammoth.js)
- [SheetJS (xlsx) docs](https://docs.sheetjs.com/)
- [Anthropic API docs](https://docs.anthropic.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 💡 Tips for Success

1. **Start Simple** - Get basic Word→Excel working before adding QA
2. **Test Early** - Use real files from Phase 1 immediately
3. **Iterate** - Don't try to handle all edge cases at once
4. **Document** - Add comments for complex parsing logic
5. **Ask** - If stuck, reference these guides or existing code

---

**Last Updated:** Phase 2 Planning Complete
**Status:** Ready for Implementation ✅
**Estimated Effort:** 2-3 weeks for full Phase 2

Good luck! 🚀
