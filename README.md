# Marketing Template Generator

A web app to generate localized marketing templates for global retail campaigns.

## Features

### Phase 1: Template Generation
- 🎨 **Multiple Deliverable Types**: Product Detail Pages, Display Ads, CRM Emails, Landing Pages
- 🌍 **17 Language Markets**: Pre-configured with major global markets
- 📊 **Excel Export**: Two-tab workbook with Copy Template and Asset Requirements
- 📝 **Word Documents**: Individual copywriter-friendly docs for each market
- 📦 **ZIP Download**: Everything packaged together for easy distribution

### Phase 2: Import & QA
- 🔄 **Word → Excel**: Import completed Word docs back to Excel templates
- 📄 **Excel → Word**: Convert Excel templates to Word documents
- 🤖 **QA Assistant**: AI-powered copy review with Claude API
  - Grammar and spelling checks
  - Tone consistency analysis
  - Terminology validation
  - Interactive chat for custom queries

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

For QA Assistant features (optional):

1. Copy `.env.example` to `.env.local`
2. Add your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment

This app is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable: `ANTHROPIC_API_KEY` (for QA features)
4. Deploy automatically

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── api/qa/          # QA Assistant API route
│   ├── import/          # Import & conversion page
│   ├── layout.js        # Root layout
│   ├── page.js          # Main generator
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── DeliverableSelector.js
│   ├── MarketSelector.js
│   ├── FileDropZone.js
│   ├── PreviewTable.js
│   ├── QAAssistant.js
│   └── QAResultsPanel.js
├── data/               # JSON catalogs
│   ├── deliverables.json
│   └── markets.json
├── lib/                # Core logic
│   ├── excelGenerator.js
│   ├── excelParser.js
│   ├── wordGenerator.js
│   └── wordParser.js
└── package.json
```

## Adding New Deliverables

Edit `data/deliverables.json` to add new deliverable types. Each deliverable includes:

- **sections**: Content structure (fields for copywriters)
- **assets**: File requirements (dimensions, formats, naming conventions)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Excel Generation**: SheetJS (xlsx)
- **Word Generation/Parsing**: docx, mammoth
- **File Packaging**: JSZip
- **AI Assistant**: Anthropic Claude API
- **Hosting**: Vercel

## License

Proprietary - Internal use only
