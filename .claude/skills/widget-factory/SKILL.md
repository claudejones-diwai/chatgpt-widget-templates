---
name: widget-factory
description: Generate ChatGPT widgets with React, MCP server, and Cloudflare deployment. Use when creating new widget examples or custom widget projects.
version: 2.0.0
---

# Widget Factory

Generates production-ready ChatGPT widget projects using proven patterns from working examples (playa-guide, priority-inbox, email-composer).

## When to Use This Skill

Use this skill when:
- User asks to create a new ChatGPT widget
- User wants to generate a widget from templates
- User requests an MCP server with interactive UI
- User wants to scaffold a widget project

## What This Generates

A complete widget project with:
- **React Widget** (TypeScript + Tailwind + Vite)
- **MCP Server** (Cloudflare Workers)
- **Shared Types** (TypeScript interfaces)
- **Deployment Config** (wrangler.toml, package.json)
- **Documentation** (README, setup instructions)

## Quick Start Workflow

### Step 1: Gather Requirements

Ask the user for:

1. **Widget purpose** (What does it do?)
2. **Tool name** (snake_case, e.g., `compose_email`)
3. **Input parameters** (What data does the tool need?)
4. **UI requirements** (Form fields, display components)

Example questions:
```
What should this widget do?
> Help users compose emails with templates

What should we call the tool?
> compose_email

What inputs does it need?
> - to (email address)
> - subject (text)
> - template (choice: blank, meeting-followup, thank-you)
```

### Step 2: Choose Base Pattern

Select from proven patterns:

**Pattern A: Form-Based Widget** (like email-composer)
- User fills in form fields
- Tool pre-fills default values
- Example: Email composer, form builder

**Pattern B: Data Display Widget** (like priority-inbox)
- Tool provides data to display
- Widget shows formatted content
- Example: Inbox viewer, dashboard

**Pattern C: Interactive Map Widget** (like playa-guide)
- Tool provides location data
- Widget shows map + details
- Example: Location finder, store locator

**Pattern D: Custom**
- Combination of above
- Novel interaction pattern

### Step 3: Generate Project Structure

Create directory structure:

```
examples/{project-name}/
├── .gitignore
├── shared-types/
│   └── tool-output.ts
├── mcp-server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml
│   └── src/
│       ├── index.ts
│       ├── handlers/
│       │   ├── health.ts
│       │   └── info.ts
│       └── tools/
│           └── {tool_name}.ts
└── widget-react/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
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

### Step 4: Implement Core Files

Follow the pattern templates (see PATTERNS.md for detailed implementations):

**4.1 Shared Types** (`shared-types/tool-output.ts`)
```typescript
export interface {ToolName}Output {
  // Define output interface based on widget requirements
}
```

**4.2 MCP Server** (`mcp-server/src/index.ts`)
- Implement JSON-RPC 2.0 methods: `initialize`, `tools/list`, `resources/read`, `tools/call`
- Set WIDGET_URL to Cloudflare Pages domain
- Add tool with proper annotations:
  ```typescript
  annotations: {
    title: "Widget Title",
    readOnlyHint: true,  // Always true for widgets that open UI
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  }
  ```

**4.3 Tool Handler** (`mcp-server/src/tools/{tool_name}.ts`)
- Accept input arguments
- Return structured output matching shared types
- Handle validation and defaults

**4.4 React Widget** (`widget-react/src/App.tsx`)
- Use `useTheme()` for dark mode support
- Use `useToolData<OutputType>()` to receive MCP data
- Implement UI based on chosen pattern
- Style with Tailwind CSS

**4.5 Vite Config** (`widget-react/vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  base: "https://{project-name}.pages.dev/",  // Must match Cloudflare Pages URL
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
```

### Step 5: Install Dependencies

```bash
# Install MCP server dependencies
cd mcp-server
npm install

# Install widget dependencies
cd ../widget-react
npm install
```

### Step 6: Build and Deploy

**6.1 Build Widget**
```bash
cd widget-react
npm run build
```

**6.2 Deploy Widget to Cloudflare Pages**
```bash
# Create project (first time only)
npx wrangler pages project create {project-name} --production-branch=main

# Deploy
npx wrangler pages deploy dist --project-name={project-name} --commit-dirty=true
```

**6.3 Deploy MCP Server to Cloudflare Workers**
```bash
cd ../mcp-server
npx wrangler deploy
```

### Step 7: Test and Commit

**7.1 Verify Deployments**
```bash
# Test MCP server health
curl https://{project-name}-mcp.{account}.workers.dev/health

# Test widget loads
curl https://{project-name}.pages.dev/ | grep "<script"
```

**7.2 Commit to Git**
```bash
git add examples/{project-name}/
git commit -m "Add {project-name} widget with MCP server

{Description of what the widget does}

- MCP server: https://{project-name}-mcp.{account}.workers.dev
- Widget: https://{project-name}.pages.dev

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

## Critical Success Factors

**✅ Always Use These Patterns:**

1. **MCP Annotations**: Always set `readOnlyHint: true` for widgets that open UI
2. **Vite Base URL**: Must match Cloudflare Pages domain exactly
3. **TypeScript Types**: Create vite-env.d.ts with ImportMeta and Window interfaces
4. **Shared Types**: Define output interface in shared-types, import in both server and widget
5. **Dark Mode**: Always implement theme detection with useTheme()
6. **Error Handling**: Add try-catch in MCP server, graceful fallbacks in widget

**❌ Common Mistakes to Avoid:**

1. Wrong Vite base URL (causes broken asset loading)
2. Missing vite-env.d.ts (causes TypeScript errors)
3. `readOnlyHint: false` for UI widgets (causes confirmation prompts)
4. Hardcoded widget URL before first deployment
5. Missing tsconfig.json `include: ["../shared-types/**/*"]`
6. Forgetting to remove `rootDir` when using shared types

## Validation Checklist

Before considering the widget complete, verify:

- [ ] Widget builds without TypeScript errors
- [ ] MCP server builds without TypeScript errors
- [ ] Widget deploys to Cloudflare Pages
- [ ] MCP server deploys to Cloudflare Workers
- [ ] Health endpoint returns 200 OK
- [ ] Widget HTML includes correct asset URLs
- [ ] Dark mode works (test theme switching)
- [ ] Tool appears in ChatGPT with correct description
- [ ] Tool invocation shows widget UI
- [ ] Widget receives and displays MCP data correctly
- [ ] All code committed to git with proper message

## Reference Files

For detailed implementation patterns and code templates:
- See [PATTERNS.md](PATTERNS.md) for proven widget patterns from working examples
- See [HOOKS.md](HOOKS.md) for standard React hooks used across all widgets
- See [DEPLOYMENT.md](DEPLOYMENT.md) for Cloudflare deployment procedures

## Examples

Our repository includes 3 proven working examples:

1. **playa-guide** - Interactive map with place listings
2. **priority-inbox** - Email inbox with filtering
3. **email-composer** - Email form with templates

Reference these examples when implementing similar functionality.
