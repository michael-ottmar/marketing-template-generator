# Marketing Template Generator

A web app to generate localized marketing templates for global retail campaigns.

## Features

- 🎨 **Multiple Deliverable Types**: Product Detail Pages, Display Ads, CRM Emails, Landing Pages
- 🌍 **17 Language Markets**: Pre-configured with major global markets
- 📊 **Excel Export**: Two-tab workbook with Copy Template and Asset Requirements
- 📝 **Word Documents**: Individual copywriter-friendly docs for each market
- 📦 **ZIP Download**: Everything packaged together for easy distribution

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
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
3. Deploy automatically

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── layout.js        # Root layout
│   ├── page.js          # Main application
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── DeliverableSelector.js
│   └── MarketSelector.js
├── data/               # JSON catalogs
│   ├── deliverables.json
│   └── markets.json
├── lib/                # Core logic
│   ├── excelGenerator.js
│   └── wordGenerator.js
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
- **Word Generation**: docx
- **File Packaging**: JSZip
- **Hosting**: Vercel

## License

Proprietary - Internal use only
