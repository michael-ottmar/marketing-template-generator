# Quick Start Guide

## 🚀 Get This Running

### Step 1: Install Dependencies
```bash
cd /Users/mikeottmar/Desktop/Clients/_TGD/Tools/marketing-template-generator
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

Then open http://localhost:3000 in your browser!

### Step 3: Push to GitHub (when ready)
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - Marketing Template Generator MVP"

# Connect to your GitHub repo (create one first on GitHub)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Step 4: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Connect your GitHub repo
4. Vercel will auto-detect Next.js and deploy!
5. Get your live URL (like: your-app.vercel.app)

## 🎨 How The App Works

### User Flow:
1. **Enter Project Name** → Sets filename prefixes
2. **Select Deliverables** → Choose PDP, Display Ads, CRM, Landing Pages
3. **Select Markets** → Pick languages (grouped by region)
4. **Generate** → Downloads ZIP with Excel + Word docs

### What Gets Generated:
- **Excel File** (2 tabs):
  - Tab 1: Copy Template (Deliverable | Name | en-US | de-DE | etc.)
  - Tab 2: Asset Requirements (dimensions, file sizes, naming conventions)
  
- **Word Documents** (one per market):
  - Copywriter-friendly format
  - Section headings + field labels
  - Ready for translation

## 📝 Adding New Deliverables

Edit `data/deliverables.json`:

```json
{
  "Your New Deliverable": {
    "id": "unique_id",
    "description": "What this is for",
    "sections": [
      {
        "name": "Section Name",
        "fields": ["Field 1", "Field 2"]
      }
    ],
    "assets": [
      {
        "name": "Asset Name",
        "width": 1920,
        "height": 1080,
        "maxFileSizeMB": 2,
        "formats": [".jpg", ".png"],
        "filenameFormat": "{sku}_asset_{locale}"
      }
    ]
  }
}
```

Changes take effect immediately (just refresh browser in dev mode)!

## 🐛 Troubleshooting

**Can't run npm install?**
- Make sure Node.js 18+ is installed: `node --version`

**Port 3000 already in use?**
- Kill the process: `lsof -ti:3000 | xargs kill`
- Or use different port: `npm run dev -- -p 3001`

**Files not generating?**
- Check browser console for errors (F12 → Console tab)
- Make sure you selected at least 1 deliverable and 1 market

## 🎯 Next Steps (Post-MVP)

- [ ] Add ability to save/load project configurations
- [ ] Add admin UI to manage deliverables catalog
- [ ] Add user authentication (if needed)
- [ ] Add project history/versioning
- [ ] Add ability to edit field names in UI
- [ ] Add custom market addition feature

## 💡 Architecture Notes

**Why client-side generation?**
- No server costs
- Privacy-friendly (no data sent to backend)
- Instant downloads
- Easy to host (static on Vercel)

**Why Next.js?**
- Vercel's native framework (optimized deployment)
- Modern React patterns (App Router)
- Built-in optimization
- Great developer experience

**Why JSON catalogs?**
- Easy to version control
- Git-friendly (see changes in diffs)
- No database needed for MVP
- Can migrate to database later if needed
