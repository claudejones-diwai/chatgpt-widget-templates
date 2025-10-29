# {{WIDGET_NAME}} - Widget Specification

## Overview

**Tool Name:** `{{TOOL_NAME}}`
**Description:** {{TOOL_DESCRIPTION}}
**Version:** 1.0.0

## Input Schema

The tool accepts the following inputs:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| name | string | Yes | User's name | Min 2 characters |
| formal | boolean | No | Use formal greeting | - |

### Example Input

```json
{
  "name": "John Doe",
  "formal": true
}
```

## Output Schema

The tool returns the following data structure:

| Field | Type | Description |
|-------|------|-------------|
| greeting | string | Personalized greeting message |
| formal | boolean | Whether formal greeting was used |
| timestamp | string | ISO 8601 timestamp |
| error | boolean | (Optional) True if error occurred |
| message | string | (Optional) Error message |

### Example Output (Success)

```json
{
  "greeting": "Good day, John Doe.",
  "formal": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Example Output (Error)

```json
{
  "error": true,
  "message": "name is required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Widget Components

### 1. InputForm Component

**Location:** `widget-react/src/components/InputForm.tsx`

**Purpose:** Collects user input before calling the tool

**Customization:**
- Add new form fields
- Update validation rules
- Change styling

**Example: Adding a new field**

```typescript
// In InputForm.tsx
const [email, setEmail] = useState("");

<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
/>
```

Don't forget to update:
- `shared-types/tool-input.ts` (add email field)
- `mcp-server/src/tools/{{TOOL_NAME}}.ts` (handle email)

### 2. DataDisplay Component

**Location:** `widget-react/src/components/DataDisplay.tsx`

**Purpose:** Displays tool output

**Customization:**
- Change layout
- Add visualizations
- Format data differently

### 3. Error Handling

**Components:**
- `ErrorState.tsx` - User-facing errors
- `ErrorBoundary.tsx` - React error catching
- `DevMode.tsx` - Development environment

## MCP Server

### Tool Handler

**Location:** `mcp-server/src/tools/{{TOOL_NAME}}.ts`

**Purpose:** Implements business logic

**Customization Example:**

```typescript
export async function handleTool(args: Record<string, unknown>) {
  const input = args as HelloWorldToolInput;

  // Call external API
  const response = await fetch('https://api.example.com/greet', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  const data = await response.json();

  return {
    greeting: data.greeting,
    formal: input.formal || false,
    timestamp: new Date().toISOString(),
  };
}
```

### Validation

**Location:** `mcp-server/src/utils/validation.ts`

**Customization:**
- Add custom validation rules
- Validate against external data
- Add regex patterns

### Error Handling

**Location:** `mcp-server/src/utils/errors.ts`

**Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `EXECUTION_ERROR` - Tool execution failed
- `API_ERROR` - External API call failed
- `NOT_FOUND` - Resource not found

## UI Customization

### Theme Support

The widget supports light and dark themes via Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-gray-100">
    {{WIDGET_NAME}}
  </h1>
</div>
```

### Display Modes

The widget adapts to three display modes:

```typescript
const displayMode = useDisplayMode(); // "inline" | "pip" | "fullscreen"

const containerMaxWidth =
  displayMode === "fullscreen" ? "max-w-4xl" :
  displayMode === "pip" ? "max-w-md" :
  "max-w-2xl";
```

### Responsive Design

Tailwind breakpoints:
- Mobile: default (< 640px)
- Tablet: `sm:` (≥ 640px)
- Desktop: `md:` (≥ 768px), `lg:` (≥ 1024px)

## Adding New Features

### Example: Add a "Save to Favorites" Feature

**1. Update types** (`shared-types/tool-output.ts`):

```typescript
export interface HelloWorldToolOutput extends BaseToolOutput {
  greeting: string;
  formal: boolean;
  isFavorite?: boolean; // NEW
}
```

**2. Update widget state** (use `useWidgetState` hook):

```typescript
const [favorites, setFavorites] = useWidgetState<string[]>([]);

const toggleFavorite = (greeting: string) => {
  setFavorites(prev =>
    prev.includes(greeting)
      ? prev.filter(g => g !== greeting)
      : [...prev, greeting]
  );
};
```

**3. Add UI** (`DataDisplay.tsx`):

```tsx
<button
  onClick={() => toggleFavorite(data.greeting)}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  {favorites.includes(data.greeting) ? "★ Favorited" : "☆ Add to Favorites"}
</button>
```

**4. Persist on server** (optional):

```typescript
// In mcp-server tool handler
await saveToDatabase({
  userId: args.userId,
  greeting: result.greeting,
  isFavorite: true,
});
```

## API Integration

### Example: Call OpenAI API

**1. Set up secret:**

```bash
cd mcp-server
wrangler secret put OPENAI_API_KEY
```

**2. Update tool handler:**

```typescript
export async function handleTool(
  args: Record<string, unknown>,
  env: Env // Cloudflare Workers environment
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: `Generate a greeting for ${args.name}` }
      ],
    }),
  });

  const data = await response.json();

  return {
    greeting: data.choices[0].message.content,
    formal: args.formal || false,
    timestamp: new Date().toISOString(),
  };
}
```

**3. Update types for `Env`:**

```typescript
// mcp-server/src/types/env.ts
export interface Env {
  OPENAI_API_KEY: string;
  // Add other secrets here
}
```

## Testing

### Test Widget Locally

```bash
cd widget-react
npm run dev
```

Open browser console and mock data:

```javascript
window.openai = {
  theme: 'light',
  displayMode: 'inline',
  maxHeight: 600,
  locale: 'en-US',
  toolOutput: {
    greeting: 'Hello, John!',
    formal: false,
    timestamp: new Date().toISOString(),
  },
};
```

### Test MCP Server Locally

```bash
cd mcp-server
npm run dev

# Test health endpoint
curl http://localhost:8787/health

# Test info endpoint
curl http://localhost:8787/info
```

## Performance Optimization

### Widget Bundle Size

Target: < 200KB gzipped

**Check size:**
```bash
cd widget-react
npm run build
ls -lh dist/assets/*.js
```

**Reduce size:**
- Use dynamic imports: `const Heavy = lazy(() => import('./Heavy'))`
- Remove unused dependencies
- Use tree-shaking (Vite does this automatically)

### MCP Server Performance

- Cache responses when possible
- Use Cloudflare KV for persistent data
- Minimize API calls

## Security Checklist

- [ ] Never commit .env files
- [ ] Use `wrangler secret` for API keys
- [ ] Escape all user input in UI
- [ ] Validate all inputs on server
- [ ] Use HTTPS for all API calls
- [ ] Set appropriate CORS headers
- [ ] Rate limit API calls

## Deployment Checklist

- [ ] Widget builds without errors
- [ ] MCP server builds without errors
- [ ] Widget URL updated in MCP server
- [ ] All secrets set via Wrangler
- [ ] Widget deploys to Pages successfully
- [ ] MCP server deploys to Workers successfully
- [ ] Tool appears in ChatGPT
- [ ] Widget displays correctly in ChatGPT
- [ ] Error handling works
- [ ] Theme switching works
- [ ] Mobile responsive

## Support

For issues or questions:
- Check TROUBLESHOOTING section in README.md
- Review Cloudflare documentation
- Check browser console for errors
- Test MCP server health endpoint

## Version History

**1.0.0** ({{CURRENT_DATE}})
- Initial release
- Basic greeting functionality
- Light/dark theme support
- Responsive design
