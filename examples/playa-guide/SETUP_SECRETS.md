# Playa del Carmen Guide - Secrets Setup

## Mapbox Access Token Setup

### Step 1: Create Mapbox Tokens

Go to [Mapbox Account > Access Tokens](https://account.mapbox.com/access-tokens/)

**Create Token 1: Public Widget Token**
1. Click "Create a token"
2. Name: `Playa Guide Widget - Public`
3. Scopes:
   - ✅ Check **only** "Styles:Read"
   - ❌ Uncheck everything else
4. URL Restrictions:
   - Add: `https://playa-guide-widget.pages.dev/*`
   - Add: `http://localhost:5173/*` (for local development)
5. Copy the token (starts with `pk.`)

**Optional - Token 2: Secret Server Token** (not currently needed)
- For future backend API calls
- No URL restrictions
- Keep truly secret

---

## Step 2: Local Development Setup

### For Widget (React)

```bash
cd examples/playa-guide/widget-react

# Create .env file from template
cp ../.env.example .env

# Edit .env and add your PUBLIC token:
# VITE_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
```

### For MCP Server (optional - not currently needed)

```bash
cd examples/playa-guide/mcp-server

# Create .dev.vars file from template
cp .dev.vars.example .dev.vars

# Edit .dev.vars if you need backend token:
# MAPBOX_ACCESS_TOKEN=sk.your_secret_token_here
```

---

## Step 3: Production Deployment

### Widget (Cloudflare Pages)

After deploying the widget, set environment variable:

**Option A: Via Cloudflare Dashboard**
1. Go to Cloudflare Dashboard > Pages > playa-guide-widget
2. Settings > Environment variables
3. Add: `VITE_MAPBOX_ACCESS_TOKEN` = your public token

**Option B: Via CLI**
```bash
cd examples/playa-guide/widget-react
wrangler pages secret put VITE_MAPBOX_ACCESS_TOKEN
# Paste your public token when prompted
```

### MCP Server (Cloudflare Workers)

Only if you need backend Mapbox access:

```bash
cd examples/playa-guide/mcp-server
wrangler secret put MAPBOX_ACCESS_TOKEN
# Paste your secret token when prompted
```

---

## Security Checklist

- ✅ `.env` and `.dev.vars` are in `.gitignore`
- ✅ Never commit actual tokens to git
- ✅ Public token is URL-restricted in Mapbox dashboard
- ✅ Public token has minimal scopes (only "Styles:Read")
- ✅ Secret tokens (if any) are set via `wrangler secret put`
- ✅ `.env.example` files show format without actual secrets

---

## Current Setup Status

**Widget Token**: ✅ Required (for map display)
**Server Token**: ⚪ Optional (not currently used - we use curated data)

The widget token will be visible in browser code, but that's OK because:
1. It's restricted to your specific URLs
2. It only has read permissions for map styles
3. Mapbox expects public tokens to be client-side
4. Anyone visiting your widget could see it anyway - that's the design
