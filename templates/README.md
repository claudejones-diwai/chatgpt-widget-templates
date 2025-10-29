# {{WIDGET_NAME}} - ChatGPT Widget

{{TOOL_DESCRIPTION}}

## Architecture

This project uses a **two-component architecture**:

- **Widget**: React app deployed to Cloudflare Pages (static HTML/CSS/JS)
- **MCP Server**: TypeScript server deployed to Cloudflare Workers (tool logic)

The MCP server returns the widget URL to ChatGPT, which loads it in an iframe.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up))
- Wrangler CLI: `npm install -g wrangler`
- Logged in to Wrangler: `wrangler login`

## Project Structure

```
{{PROJECT_NAME}}/
├── widget-react/           # React widget (Cloudflare Pages)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utilities
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── mcp-server/            # MCP server (Cloudflare Workers)
│   ├── src/
│   │   ├── tools/         # Tool handlers
│   │   ├── handlers/      # HTTP handlers
│   │   ├── utils/         # Utilities
│   │   └── index.ts       # Worker entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml
│
├── shared-types/          # Shared TypeScript types
│   ├── openai.d.ts       # window.openai API types
│   ├── tool-input.ts     # Tool input schema
│   └── tool-output.ts    # Tool output schema
│
└── README.md             # This file
```

## Deployment Steps

### Step 1: Deploy Widget to Cloudflare Pages

```bash
cd widget-react
npm install
npm run build
npx wrangler pages deploy dist --project-name={{PROJECT_NAME}}-widget
```

**Save the widget URL from the output:**
```
✅ Deployment complete!
🌐 https://abc123.{{PROJECT_NAME}}-widget.pages.dev
```

### Step 2: Update MCP Server with Widget URL

```bash
cd ../mcp-server

# Edit src/index.ts
# Find the line:
const WIDGET_URL = "https://PLACEHOLDER-REPLACE-AFTER-WIDGET-DEPLOYMENT.pages.dev";

# Replace with your actual widget URL:
const WIDGET_URL = "https://abc123.{{PROJECT_NAME}}-widget.pages.dev";
```

### Step 3: Deploy MCP Server to Cloudflare Workers

```bash
npm install
npm run build
npm run deploy
```

**Save the MCP server URL from the output:**
```
✅ Deployment complete!
🌐 https://{{PROJECT_NAME}}-mcp-server.YOUR-SUBDOMAIN.workers.dev
```

### Step 4: Add to ChatGPT

1. Open ChatGPT Settings
2. Navigate to **Integrations** → **Custom Tools**
3. Click **Add MCP Server**
4. Enter your MCP server URL with `/sse` endpoint:
   ```
   https://{{PROJECT_NAME}}-mcp-server.YOUR-SUBDOMAIN.workers.dev/sse
   ```
5. Click **Save**

### Step 5: Test in ChatGPT

Try this prompt:
```
Use {{TOOL_NAME}} with name "John" and formal greeting
```

You should see your widget appear with the greeting!

## Development

### Run Widget Locally

```bash
cd widget-react
npm run dev
# Open http://localhost:4444
```

### Run MCP Server Locally

```bash
cd mcp-server
npm run dev
# Test: curl http://localhost:8787/health
```

### View MCP Server Logs

```bash
cd mcp-server
npm run tail
```

## Customization

See [WIDGET_SPEC.md](./WIDGET_SPEC.md) for details on:
- Input/output schemas
- Customizing the UI
- Adding new features
- Error handling

## Updating

### Update Widget

```bash
cd widget-react
# Make changes to src/
npm run build
npm run deploy
```

### Update MCP Server

```bash
cd mcp-server
# Make changes to src/
npm run build
npm run deploy
```

## Troubleshooting

### Widget Not Loading

- Check browser console (F12) for errors
- Verify widget URL in `mcp-server/src/index.ts`
- Ensure Pages deployment succeeded
- Check CORS settings

### Tool Not Appearing in ChatGPT

- Verify MCP server URL ends with `/sse`
- Check server logs: `npm run tail`
- Test health endpoint: `curl YOUR-WORKER-URL/health`
- Verify tool is registered in `ListToolsRequestSchema` handler

### "No data received" Error

- Check that `window.openai.toolOutput` has data
- Verify MCP server returns `resource` type response
- Check browser console for JavaScript errors
- Test MCP server locally first

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

## Environment Variables

For production secrets (API keys, etc.):

```bash
cd mcp-server

# Set secrets via Wrangler CLI
wrangler secret put OPENAI_API_KEY
wrangler secret put DATABASE_URL

# Access in code:
const apiKey = env.OPENAI_API_KEY;
```

## Tech Stack

**Widget:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

**MCP Server:**
- TypeScript
- @modelcontextprotocol/sdk
- Cloudflare Workers

## Resources

- [OpenAI Apps SDK Examples](https://github.com/openai/openai-apps-sdk-examples)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [MCP Protocol Docs](https://modelcontextprotocol.io)

## License

MIT
