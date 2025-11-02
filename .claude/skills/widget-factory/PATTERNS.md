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

## Advanced Patterns

### Server Actions Pattern

Server actions enable widgets to perform async operations after initial load.

**Use Cases:**
- AI generation (images, text, suggestions)
- File upload to storage
- Publishing to external services
- Fetching additional data

**MCP Server Implementation:**

```typescript
// src/index.ts - Add server action to tools/call handler
case "tools/call":
  const toolName = body.params?.name;
  const toolArgs = body.params?.arguments || {};

  // Main tool
  if (toolName === "compose_linkedin_post") {
    const toolData = handleComposeLinkedInPost(toolArgs);
    result = {
      content: [{ type: "text", text: "Opening LinkedIn Post Composer..." }],
      structuredContent: toolData,
      _meta: { "openai/outputTemplate": WIDGET_URL },
    };
  }
  // Server actions
  else if (toolName === "generate_image") {
    const imageData = await handleGenerateImage(toolArgs);
    result = {
      content: [{ type: "text", text: "Image generated successfully" }],
      structuredContent: imageData,
    };
  }
  else if (toolName === "publish_post") {
    const publishData = await handlePublishPost(toolArgs);
    result = {
      content: [{ type: "text", text: publishData.message }],
      structuredContent: publishData,
    };
  }
  else {
    return jsonRpcError(body.id, -32601, `Tool not found: ${toolName}`);
  }
  break;
```

**Server Action Handler:**

```typescript
// src/tools/generate_image.ts
import type { GenerateImageOutput } from "../../shared-types";

export interface GenerateImageArgs {
  prompt: string;
  style: string;
  size: string;
}

export async function handleGenerateImage(args: GenerateImageArgs): Promise<GenerateImageOutput> {
  // Phase 1: Return mock data
  return {
    success: true,
    message: "Image generated successfully (mock)",
    imageUrl: "https://via.placeholder.com/1024x1024",
  };

  // Phase 2: Real DALL-E API integration
  // const response = await fetch("https://api.openai.com/v1/images/generations", {
  //   method: "POST",
  //   headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}` },
  //   body: JSON.stringify({ prompt: args.prompt, size: args.size })
  // });
  // const data = await response.json();
  // return { success: true, imageUrl: data.data[0].url };
}
```

**Widget Implementation with useServerAction:**

```typescript
// src/hooks/useServerAction.ts
import { useState, useCallback } from "react";

interface ServerActionState<T> {
  loading: boolean;
  result: T | null;
  error: Error | null;
}

export function useServerAction<TArgs, TResult>(actionName: string) {
  const [state, setState] = useState<ServerActionState<TResult>>({
    loading: false,
    result: null,
    error: null,
  });

  const execute = useCallback(
    async (args: TArgs): Promise<TResult | null> => {
      setState({ loading: true, result: null, error: null });

      try {
        const response = await fetch(window.openai?.toolOutput?.mcpServerUrl + "/mcp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: { name: actionName, arguments: args },
          }),
        });

        const data = await response.json();
        const result = data.result?.structuredContent;
        setState({ loading: false, result, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, result: null, error: error as Error });
        return null;
      }
    },
    [actionName]
  );

  return { ...state, execute };
}
```

**Usage in Component:**

```typescript
// src/App.tsx
import { useServerAction } from "./hooks";

const generateImage = useServerAction<{ prompt: string; style: string; size: string }, GenerateImageOutput>("generate_image");
const publishPost = useServerAction<PublishPostArgs, PublishPostOutput>("publish_post");

const handleGenerateImage = async (prompt: string) => {
  const result = await generateImage.execute({
    prompt,
    style: "professional",
    size: "1024x1024"
  });

  if (result?.success) {
    setImageUrl(result.imageUrl);
  }
};

// Show loading state
{generateImage.loading && <div>Generating image...</div>}

// Show result
{generateImage.result?.success && <img src={generateImage.result.imageUrl} />}
```

### Edit/Preview Tabs Pattern

Separate editing and preview into distinct views for content creation widgets.

**When to Use:**
- Content creation widgets (posts, emails, documents)
- User needs to see final output before publishing
- Multiple editing steps before submission

**Implementation:**

```typescript
// src/App.tsx
type ViewMode = 'edit' | 'preview';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setViewMode('edit')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            viewMode === 'edit'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Edit3 className="w-4 h-4 inline mr-2" />
          Edit
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            viewMode === 'preview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Preview
        </button>
      </div>

      {/* Edit View */}
      {viewMode === 'edit' && (
        <div className="p-6 space-y-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={10}
          />
          {/* Other editing controls */}
        </div>
      )}

      {/* Preview View */}
      {viewMode === 'preview' && (
        <div className="p-6">
          <div className="prose dark:prose-invert">
            {content}
          </div>
          {imageUrl && <img src={imageUrl} alt="Preview" />}
        </div>
      )}

      {/* Action Buttons - Context-aware */}
      {viewMode === 'edit' ? (
        <button onClick={() => setViewMode('preview')}>
          See Preview
        </button>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => setViewMode('edit')}>Back</button>
          <button onClick={handlePublish}>Publish</button>
        </div>
      )}
    </div>
  );
}
```

### Toast Notifications Pattern

Provide user feedback for async operations without blocking the UI.

**When to Use:**
- Server action completes (success or error)
- Background operations finish
- User needs non-blocking feedback

**Implementation:**

```typescript
// src/components/Toast.tsx
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
}

export function Toast({ message, type = "success", onDismiss }: ToastProps) {
  const bgColor = {
    success: "bg-green-600 dark:bg-green-700",
    error: "bg-red-600 dark:bg-red-700",
    info: "bg-blue-600 dark:bg-blue-700",
  }[type];

  const icon = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[type];

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className={`px-6 py-4 ${bgColor} text-white rounded-lg shadow-lg flex items-center gap-3 min-w-[320px]`}>
        <div className="flex-shrink-0">{icon}</div>
        <span className="text-base font-medium whitespace-nowrap">{message}</span>
        <button onClick={onDismiss} className="ml-auto">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

**Usage with Async Operation Tracking:**

```typescript
// src/App.tsx or component
const [showToast, setShowToast] = useState(false);
const [wasGenerating, setWasGenerating] = useState(false);

// Track when operation completes
useEffect(() => {
  if (generateImage.loading) {
    setWasGenerating(true);
  } else if (wasGenerating) {
    setWasGenerating(false);
    setShowToast(true); // Show toast when generation completes
  }
}, [generateImage.loading, wasGenerating]);

return (
  <>
    {showToast && (
      <Toast
        message="Image added! Click Preview to see it"
        type="success"
        onDismiss={() => setShowToast(false)}
      />
    )}
  </>
);
```

### Async Operation Tracking Pattern

Track async operation completion to trigger UI updates or notifications.

**Problem:** How to detect when an async operation completes and trigger side effects (like showing a toast)?

**Solution:** Use "wasX" state pattern to detect transitions from loading to complete.

```typescript
const [wasGenerating, setWasGenerating] = useState(false);
const [wasUploading, setWasUploading] = useState(false);

const generateImage = useServerAction<GenerateImageArgs, GenerateImageOutput>("generate_image");
const uploadImage = useServerAction<UploadImageArgs, UploadImageOutput>("upload_image");

// Track generation state - show toast when complete
useEffect(() => {
  if (generateImage.loading) {
    setWasGenerating(true);
  } else if (wasGenerating) {
    setWasGenerating(false);
    // Operation just completed
    setShowToast(true);
    setShowEditor(false); // Close editor
  }
}, [generateImage.loading, wasGenerating]);

// Track upload state - show toast when complete
useEffect(() => {
  if (uploadImage.loading) {
    setWasUploading(true);
  } else if (wasUploading) {
    setWasUploading(false);
    // Operation just completed
    setShowToast(true);
  }
}, [uploadImage.loading, wasUploading]);
```

**Pattern Breakdown:**
1. When operation starts (`loading === true`), set `wasX = true`
2. When operation completes (`loading === false` and `wasX === true`), trigger side effects
3. Reset `wasX = false` after handling completion

This pattern is more reliable than auto-dismiss timers and gives user control.

### Success State Pattern

Hide the form and show a compact success message after successful completion.

**When to Use:**
- After publishing/submitting content
- After completing a multi-step flow
- When the widget's primary action is complete

**Implementation:**

```typescript
// src/App.tsx
export default function App() {
  const publishPost = useServerAction<PublishPostArgs, PublishPostOutput>("publish_post");

  // Conditional container height - compact after success
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className={`bg-gray-50 dark:bg-gray-900 ${publishPost.result?.success ? 'min-h-fit' : 'min-h-screen'}`}>
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <h1>Widget Title</h1>

          {/* Show form only if not successfully published */}
          {!publishPost.result?.success && (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b">...</div>

              {/* Edit View */}
              {viewMode === 'edit' && <div>...</div>}

              {/* Preview View */}
              {viewMode === 'preview' && <div>...</div>}
            </>
          )}

          {/* Success State - Replaces entire form */}
          {publishPost.result?.success ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Published successfully!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {publishPost.result.message}
                  </p>
                  {publishPost.result.postUrl && (
                    <a
                      href={publishPost.result.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      View Post
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : publishPost.result && !publishPost.result.success ? (
            /* Error State */
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Failed to publish</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{publishPost.result.message}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

**Key Points:**
- Hide form with `{!publishPost.result?.success && (...)}`
- Adjust container height: `min-h-screen` → `min-h-fit`
- Show success/error messages in place of form
- No close buttons needed (ChatGPT manages widget lifecycle)

### File Upload Pattern

Handle client-side file uploads with validation and server action integration.

**When to Use:**
- Widget needs to upload images/documents
- Files should be validated before upload
- Preview needed before publishing

**Client-Side Implementation:**

```typescript
// src/components/FileUpload.tsx
interface FileUploadProps {
  onUpload: (file: File, dataUrl: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({ onUpload, accept = "image/*", maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [error, setError] = useState<string>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (maxSize && file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError(`File type must be ${accept}`);
      return;
    }

    setError(undefined);

    // Read file as data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onUpload(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <Upload className="w-4 h-4" />
        Upload File
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
```

**Usage with Server Action:**

```typescript
// src/App.tsx
const [uploadedFile, setUploadedFile] = useState<{ file: File; dataUrl: string }>();
const uploadImage = useServerAction<UploadImageArgs, UploadImageOutput>("upload_image");

const handleUpload = (file: File, dataUrl: string) => {
  // Phase 1: Use data URL directly for preview
  setUploadedFile({ file, dataUrl });
  setImageUrl(dataUrl);

  // Phase 2: Upload to server
  // const formData = new FormData();
  // formData.append('file', file);
  // uploadImage.execute({ file: formData });
};

return (
  <FileUpload
    onUpload={handleUpload}
    accept="image/*"
    maxSize={5 * 1024 * 1024}
  />
);
```

**Server Action (Phase 2):**

```typescript
// src/tools/upload_image.ts
import type { UploadImageOutput } from "../../shared-types";

export interface UploadImageArgs {
  fileName: string;
  fileType: string;
  fileData: string; // Base64 encoded
}

export async function handleUploadImage(args: UploadImageArgs, env: Env): Promise<UploadImageOutput> {
  // Phase 1: Return mock success
  return {
    success: true,
    message: "Image uploaded (mock)",
    imageUrl: args.fileData, // Return the data URL
  };

  // Phase 2: Upload to Cloudflare R2
  // const buffer = Buffer.from(args.fileData.split(',')[1], 'base64');
  // const key = `${Date.now()}-${args.fileName}`;
  // await env.R2_BUCKET.put(key, buffer, {
  //   httpMetadata: { contentType: args.fileType }
  // });
  // return {
  //   success: true,
  //   imageUrl: `https://your-r2-domain/${key}`
  // };
}
```

## Widget Lifecycle and Restrictions

**Important:** ChatGPT widgets run in a sandboxed iframe and have lifecycle restrictions.

### What Widgets CANNOT Do:

1. **Close themselves**: `window.close()` does not work
2. **Navigate parent window**: Cannot control ChatGPT's navigation
3. **Access parent window**: Sandboxed iframe prevents cross-origin access
4. **Refresh themselves**: Should not implement refresh buttons

### What ChatGPT Controls:

1. **Widget Opening**: ChatGPT decides when to open the widget based on tool invocation
2. **Widget Closing**: User closes via ChatGPT's UI (not widget's close button)
3. **Lifecycle**: ChatGPT manages the widget's lifecycle

### Best Practices:

1. **No Close/Cancel Buttons**: Don't add close or cancel buttons
2. **Success State**: Show success message, let ChatGPT handle closure
3. **Error Handling**: Show errors inline, allow retry
4. **Navigation**: Use tabs/views within widget, not navigation away

**Reference:** See [ChatGPT Widget Examples](https://github.com/openai/openai-apps-sdk-examples) - none have close buttons.

## Deployment Checklist

Before deploying:

- [ ] Update vite.config.ts `base` URL to match Cloudflare Pages project name
- [ ] Update MCP server WIDGET_URL to match Cloudflare Pages project name
- [ ] Build widget succeeds without errors
- [ ] Build MCP server succeeds without errors
- [ ] No TypeScript errors
- [ ] Dark mode works correctly
- [ ] All required dependencies installed
- [ ] No close/cancel buttons in widget UI
- [ ] Success state shows message instead of close button

After deploying:

- [ ] Widget loads at {project-name}.pages.dev
- [ ] Assets load correctly (check browser console)
- [ ] MCP server health endpoint returns 200
- [ ] MCP /mcp endpoint responds to tools/list
- [ ] Widget receives and displays toolData correctly
- [ ] Server actions work (if implemented)
- [ ] Toast notifications show correctly
- [ ] Success state displays properly
