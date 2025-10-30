# Playa del Carmen Guide - Mapbox Setup

## Quick Start: 3 Simple Steps

### Step 1: Create Your Mapbox Token

Go to [Mapbox Account > Access Tokens](https://account.mapbox.com/access-tokens/)

1. Click **"Create a token"**
2. **Name:** `Playa Guide Widget`
3. **Scopes:** Check **ONLY** "Styles:Read" (uncheck everything else)
4. **URL Restrictions:**
   - Add: `http://localhost:5173/*` (for testing locally)
   - Add: `https://playa-guide-widget.pages.dev/*` (we'll deploy here later)
5. **Copy the token** (starts with `pk.eyJ...`)

### Step 2: Create Your Local .env File

```bash
cd examples/playa-guide/widget-react

# Create .env file with your token
echo "VITE_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here" > .env
```

**Important:** Replace `pk.your_actual_token_here` with your real token!

### Step 3: Test Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` - you should see the widget with a map!

---

## Production Deployment (After Local Testing)

When deploying to Cloudflare Pages, set the environment variable:

**Via Cloudflare Dashboard:**
1. Go to: Cloudflare Dashboard > Pages > playa-guide-widget
2. Settings > Environment variables
3. Add variable:
   - Name: `VITE_MAPBOX_ACCESS_TOKEN`
   - Value: `pk.your_actual_token_here`

**Or via CLI:**
```bash
wrangler pages secret put VITE_MAPBOX_ACCESS_TOKEN
# Paste your token when prompted
```

---

## FAQ

**Q: Do I need a credit card for Mapbox?**
A: No! The free tier (50,000 map loads/month) is sufficient.

**Q: Is my token safe if it's visible in browser code?**
A: Yes! That's the design. You protected it by:
- URL restrictions (only works on your domains)
- Minimal scopes (only "Styles:Read")

**Q: What about the MCP server - does it need Mapbox?**
A: No! The server uses our curated dataset (28 places). No Mapbox API calls needed.

**Q: The .env file doesn't exist - is that normal?**
A: Yes! You create it yourself in Step 2. It's never committed to git (protected by .gitignore).

---

## Troubleshooting

**"Module not found: mapbox-gl"**
→ Run: `npm install`

**Map not loading, console shows 401 error**
→ Check your token in `.env` file (must start with `pk.`)

**Map loading but tiles are blank**
→ Check URL restrictions in Mapbox dashboard include `http://localhost:5173/*`
