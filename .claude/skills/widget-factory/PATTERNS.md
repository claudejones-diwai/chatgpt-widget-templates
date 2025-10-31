# Widget Implementation Patterns

Detailed patterns extracted from working examples: playa-guide, priority-inbox, email-composer.

## Table of Contents

- [MCP Server Pattern](#mcp-server-pattern)
- [React Widget Pattern](#react-widget-pattern)
- [Shared Types Pattern](#shared-types-pattern)
- [Hooks Pattern](#hooks-pattern)
- [Deployment Pattern](#deployment-pattern)

## MCP Server Pattern

### File Structure

```
mcp-server/
├── package.json
├── tsconfig.json
├── wrangler.toml
└── src/
    ├── index.ts              # Main server with JSON-RPC handlers
    ├── handlers/
    │   ├── health.ts         # Health check endpoint
    │   └── info.ts           # Server info endpoint
    └── tools/
        └── {tool_name}.ts    # Tool implementation
```

### Complete MCP Server Template

```typescript
// src/index.ts
import { handle{ToolName} } from "./tools/{tool_name}";
import { handleHealth } from "./handlers/health";
import { handleInfo } from "./handlers/info";

const WIDGET_URL = "https://{project-name}.pages.dev";

export interface Env {
  // Add environment variables here if needed
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight FIRST
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Health check
    if (url.pathname === "/health") {
      return handleHealth(WIDGET_URL);
    }

    // Server info
    if ((url.pathname === "/" || url.pathname === "/info") && request.method === "GET") {
      return handleInfo(WIDGET_URL);
    }

    // MCP JSON-RPC endpoint
    if (url.pathname === "/mcp") {
      const contentType = request.headers.get("Content-Type") || "";

      if (request.method === "POST" && contentType.includes("application/json")) {
        try {
          const body = (await request.json()) as any;

          if (body.jsonrpc !== "2.0") {
            return jsonRpcError(body.id, -32600, "Invalid Request: must be JSON-RPC 2.0");
          }

          let result;

          switch (body.method) {
            case "initialize":
              result = {
                protocolVersion: "2025-06-18",
                capabilities: { tools: {}, resources: {} },
                serverInfo: {
                  name: "{project-name}-mcp-server",
                  version: "1.0.0",
                },
              };
              break;

            case "notifications/initialized":
              return new Response(null, {
                status: 204,
                headers: { "Access-Control-Allow-Origin": "*" },
              });

            case "tools/list":
              result = {
                tools: [
                  {
                    name: "{tool_name}",
                    description: "{Tool description for ChatGPT}",
                    inputSchema: {
                      type: "object",
                      properties: {
                        // Define input parameters
                      },
                      required: [],
                    },
                    annotations: {
                      title: "{Widget Title}",
                      readOnlyHint: true,
                      destructiveHint: false,
                      idempotentHint: true,
                      openWorldHint: false,
                    },
                    _meta: {
                      "openai/outputTemplate": WIDGET_URL,
                    },
                  },
                ],
              };
              break;

            case "resources/read":
              const requestedUri = body.params?.uri;
              const normalizedRequested = parseUri(requestedUri);
              const normalizedWidget = parseUri(WIDGET_URL);

              if (normalizedRequested === normalizedWidget) {
                const widgetResponse = await fetch(WIDGET_URL);
                const widgetHtml = await widgetResponse.text();
                result = {
                  contents: [
                    {
                      uri: requestedUri,
                      mimeType: "text/html+skybridge",
                      text: widgetHtml,
                    },
                  ],
                };
              } else {
                return jsonRpcError(body.id, -32602, `Resource not found: ${requestedUri}`);
              }
              break;

            case "tools/call":
              const toolName = body.params?.name;
              const toolArgs = body.params?.arguments || {};

              if (toolName === "{tool_name}") {
                const toolData = handle{ToolName}(toolArgs);
                result = {
                  content: [
                    {
                      type: "text",
                      text: `{Success message}`,
                    },
                  ],
                  structuredContent: toolData,
                  _meta: {
                    "openai/outputTemplate": WIDGET_URL,
                  },
                };
              } else {
                return jsonRpcError(body.id, -32601, `Tool not found: ${toolName}`);
              }
              break;

            default:
              return jsonRpcError(body.id, -32601, `Method not found: ${body.method}`);
          }

          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id,
              result,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        } catch (error: any) {
          return jsonRpcError(null, -32603, "Internal server error", error.message);
        }
      }
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};

// Helper functions
function parseUri(uri: string) {
  try {
    const url = new URL(uri);
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    return `${url.origin}${pathname}`;
  } catch {
    return uri?.replace(/\/$/, "");
  }
}

function jsonRpcError(id: any, code: number, message: string, data?: any) {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code, message, data },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
```

### Tool Handler Template

```typescript
// src/tools/{tool_name}.ts
import type { {ToolName}Output } from "../../shared-types/tool-output";

export interface {ToolName}Args {
  // Define input arguments
}

export function handle{ToolName}(args: {ToolName}Args): {ToolName}Output {
  // Implement tool logic
  // Return structured output matching interface

  return {
    // Output fields
  };
}
```

### Health Handler

```typescript
// src/handlers/health.ts
export function handleHealth(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "{project-name}-mcp-server",
      widget_url: widgetUrl,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
```

### Info Handler

```typescript
// src/handlers/info.ts
export function handleInfo(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      name: "{project-name}-mcp-server",
      version: "1.0.0",
      description: "{Project description}",
      widget_url: widgetUrl,
      mcp_endpoint: "/mcp",
      health_endpoint: "/health",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
```

## React Widget Pattern

### File Structure

```
widget-react/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    └── hooks/
        ├── index.ts
        ├── useTheme.ts
        ├── useToolData.ts
        ├── useOpenAiGlobal.ts
        ├── useDisplayMode.ts
        ├── useMaxHeight.ts
        └── useWindowSize.ts
```

### App.tsx Template

```typescript
// src/App.tsx
import { useState, useEffect } from "react";
import { useTheme, useToolData } from "./hooks";
import type { {ToolName}Output } from "../../shared-types/tool-output";

export default function App() {
  const theme = useTheme();
  const toolData = useToolData<{ToolName}Output>();

  // Component state
  const [state, setState] = useState(/* initial state */);

  // Update when toolData changes
  useEffect(() => {
    if (toolData) {
      // Update component state from MCP data
    }
  }, [toolData]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Widget UI */}
      </div>
    </div>
  );
}
```

### vite-env.d.ts Template

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    openai?: {
      theme?: "light" | "dark";
      displayMode?: "full" | "compact";
      maxHeight?: number;
      toolOutput?: unknown;
      widgetState?: unknown;
      locale?: string;
    };
  }
}

export {};
```

### Vite Config Template

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "https://{project-name}.pages.dev/",
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

### Tailwind Config Template

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Package.json Template

```json
{
  "name": "{project-name}-widget",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "~5.7.2",
    "vite": "^6.4.1"
  }
}
```

## Shared Types Pattern

```typescript
// shared-types/tool-output.ts
export interface {ToolName}Output {
  // Define output structure
  // This interface is used by both MCP server and React widget
}
```

## Configuration Files

### MCP Server package.json

```json
{
  "name": "{project-name}-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250127.0",
    "typescript": "^5.7.2",
    "wrangler": "^3.114.15"
  }
}
```

### MCP Server tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*", "../shared-types/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Note: Do NOT use `rootDir` when including shared-types from parent directory.

### wrangler.toml

```toml
name = "{project-name}-mcp"
main = "dist/index.js"
compatibility_date = "2025-01-27"

[build]
command = "npm run build"

[build.upload]
format = "service-worker"
```

### Widget tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Common Patterns

### Dark Mode Support

Always implement dark mode using the `dark` class on root element:

```tsx
<div className={theme === "dark" ? "dark" : ""}>
  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    {/* Content */}
  </div>
</div>
```

### Loading States

```tsx
if (!toolData) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
```

### Error Boundaries

```tsx
if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">{error.message}</div>
    </div>
  );
}
```

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Main</div>
</div>
```

## Deployment Checklist

Before deploying:

- [ ] Update vite.config.ts `base` URL to match Cloudflare Pages project name
- [ ] Update MCP server WIDGET_URL to match Cloudflare Pages project name
- [ ] Build widget succeeds without errors
- [ ] Build MCP server succeeds without errors
- [ ] No TypeScript errors
- [ ] Dark mode works correctly
- [ ] All required dependencies installed

After deploying:

- [ ] Widget loads at {project-name}.pages.dev
- [ ] Assets load correctly (check browser console)
- [ ] MCP server health endpoint returns 200
- [ ] MCP /mcp endpoint responds to tools/list
- [ ] Widget receives and displays toolData correctly
