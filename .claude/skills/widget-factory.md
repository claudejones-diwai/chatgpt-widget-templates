---
name: widget-factory
description: Generate production-ready ChatGPT widget projects with React and MCP server
---

# Widget Factory Skill

This skill generates a complete ChatGPT widget project using the templates in this repository.

## What This Skill Does

When invoked, this skill will:

1. **Collect inputs** from the user (project name, widget name, tool description, input schema)
2. **Validate inputs** (naming conventions, schema validity)
3. **Copy template files** to a new project directory
4. **Replace placeholders** throughout all files
5. **Generate documentation** customized for the project
6. **Initialize git** repository
7. **Print next steps** for deployment

## Inputs Required

### Required Fields

- **projectName** (string)
  - Lowercase, alphanumeric + hyphens only
  - Example: `hello-world-widget`, `linkedin-poster`
  - Used for: directory name, npm package name, tool identifiers

- **widgetName** (string)
  - Human-readable display name
  - Example: `Hello World`, `LinkedIn Post Creator`
  - Used for: UI titles, documentation

- **toolName** (string)
  - Tool identifier in snake_case
  - Example: `greet_user`, `create_linkedin_post`
  - Used for: MCP tool registration

- **toolDescription** (string)
  - Short description of what the tool does
  - Max 200 characters
  - Example: `Generates personalized greetings`

### Optional Fields

- **targetDirectory** (string, default: `./`)
  - Where to create the project
  - Example: `../my-projects/`

- **initGit** (boolean, default: true)
  - Initialize git repository

- **inputs** (array of input field definitions)
  - Define custom input schema
  - Each input has: name, type, required, description

## Execution Steps

### Step 1: Collect Inputs

Prompt the user for all required and optional fields. Use an interactive Q&A format:

```
I'll help you generate a ChatGPT widget project!

1. Project name (lowercase, use hyphens):
   Example: hello-world-widget
   >

2. Widget display name (human-readable):
   Example: Hello World
   >

3. Tool name (snake_case):
   Example: greet_user
   >

4. Tool description (what does it do?):
   Example: Generates personalized greetings
   >

5. Where should I create the project? (default: current directory)
   >

6. Initialize git repository? (y/n, default: yes)
   >
```

### Step 2: Validate Inputs

**projectName validation:**
- Must be lowercase
- Only alphanumeric and hyphens
- No spaces or special characters
- Regex: `^[a-z0-9-]+$`

**toolName validation:**
- Must be snake_case
- Only lowercase letters and underscores
- Regex: `^[a-z_]+$`

**toolDescription validation:**
- Max 200 characters
- Not empty

If validation fails, show error and re-prompt.

### Step 3: Create Project Directory Structure

```bash
mkdir -p {targetDirectory}/{projectName}
cd {targetDirectory}/{projectName}

# Copy template structure
cp -r {TEMPLATE_ROOT}/widget-react ./widget-react
cp -r {TEMPLATE_ROOT}/mcp-server ./mcp-server
cp -r {TEMPLATE_ROOT}/shared-types ./shared-types
cp {TEMPLATE_ROOT}/.gitignore ./.gitignore
cp {TEMPLATE_ROOT}/.env.example ./.env.example
cp {TEMPLATE_ROOT}/README.md ./README.md
cp {TEMPLATE_ROOT}/WIDGET_SPEC.md ./WIDGET_SPEC.md
```

### Step 4: Replace Placeholders

Search and replace these placeholders in ALL files:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `{{PROJECT_NAME}}` | projectName | `hello-world-widget` |
| `{{WIDGET_NAME}}` | widgetName | `Hello World` |
| `{{TOOL_NAME}}` | toolName | `greet_user` |
| `{{TOOL_DESCRIPTION}}` | toolDescription | `Generates greetings` |
| `{{CURRENT_DATE}}` | today's date | `2024-01-15` |

**Files to update:**
- All `.ts`, `.tsx`, `.js`, `.jsx` files
- All `.json` files (package.json, tsconfig.json)
- All `.md` files (README, WIDGET_SPEC)
- `wrangler.toml`
- `.env.example`

**Special handling:**
- In `mcp-server/src/tools/`, rename `{{TOOL_NAME}}.ts` to actual tool name (e.g., `greet_user.ts`)
- In `public/index.html`, update root element ID
- In `src/main.tsx`, update root element selector

### Step 5: Customize Input Schema (if provided)

If user provided custom inputs array, update:

1. **shared-types/tool-input.ts**
   - Replace HelloWorldToolInput interface
   - Update TOOL_INPUT_SCHEMA

2. **shared-types/tool-output.ts**
   - Update output interface if needed

3. **widget-react/src/components/InputForm.tsx**
   - Generate form fields for each input
   - Add validation rules

4. **mcp-server/src/index.ts**
   - Update ListToolsRequestSchema with actual input schema

Example custom input:
```json
{
  "inputs": [
    { "name": "title", "type": "string", "required": true, "description": "Post title" },
    { "name": "content", "type": "string", "required": true, "description": "Post content" },
    { "name": "tags", "type": "array", "required": false, "description": "Post tags" }
  ]
}
```

### Step 6: Generate Custom Documentation

Update README.md and WIDGET_SPEC.md with:
- Actual project name
- Actual tool name
- Actual description
- Current date
- Customized examples

### Step 7: Initialize Git (if requested)

```bash
cd {projectDirectory}
git init
git add .
git commit -m "Initial commit: Generated {{PROJECT_NAME}} widget

Generated using chatgpt-widget-templates
- Widget: React + TypeScript + Tailwind + Vite
- MCP Server: Cloudflare Workers
- Tool: {{TOOL_NAME}}

Ready for deployment to Cloudflare."
```

### Step 8: Print Next Steps

```
✅ Project created successfully!

📁 Location: {fullPath}
📦 Project: {{PROJECT_NAME}}
🛠️  Tool: {{TOOL_NAME}}

Next steps:

1. Review the project structure:
   cd {{PROJECT_NAME}}
   ls -la

2. Install dependencies:
   cd widget-react && npm install
   cd ../mcp-server && npm install

3. Review WIDGET_SPEC.md for customization options

4. Deploy the widget:
   cd widget-react
   npm run build
   npx wrangler pages deploy dist --project-name={{PROJECT_NAME}}-widget

5. Update MCP server with widget URL:
   cd ../mcp-server
   # Edit src/index.ts and replace WIDGET_URL

6. Deploy MCP server:
   npm run build
   npm run deploy

7. Add to ChatGPT:
   - Settings → Integrations → Custom Tools
   - Add your MCP server URL with /sse endpoint

Need help? Check README.md for detailed instructions!
```

## Error Handling

### Common Errors

**Directory already exists:**
```
❌ Error: Directory {{PROJECT_NAME}} already exists
   Choose a different project name or remove the existing directory
```

**Invalid project name:**
```
❌ Error: Invalid project name "My Project"
   Project name must be lowercase with hyphens only
   Example: my-project
```

**Invalid tool name:**
```
❌ Error: Invalid tool name "MyTool"
   Tool name must be snake_case
   Example: my_tool
```

**Template files not found:**
```
❌ Error: Template files not found
   Make sure you're running this from the chatgpt-widget-templates repository
```

## Advanced Usage

### Custom Input Schema

User can provide detailed input schema:

```
Would you like to define custom input fields? (y/n)
> y

How many input fields?
> 2

Field 1:
  Name (snake_case): user_name
  Type (string/number/boolean/array): string
  Required? (y/n): y
  Description: User's full name
  Min length (optional): 2

Field 2:
  Name (snake_case): age
  Type (string/number/boolean/array): number
  Required? (y/n): n
  Description: User's age
  Min value (optional): 0
  Max value (optional): 120
```

Generate code from this schema for:
- TypeScript interfaces
- JSON schema for MCP
- Form components
- Validation logic

### Multiple Tools

For advanced projects with multiple tools:

```
How many tools will this widget have?
> 2

Tool 1:
  Name: create_post
  Description: Creates a new post

Tool 2:
  Name: edit_post
  Description: Edits an existing post
```

Generate multiple tool handlers and update MCP server accordingly.

## Implementation Notes

### File Operations

Use these tools:
- **Glob** - Find template files
- **Read** - Read template contents
- **Write** - Create new files in target directory
- **Edit** - Replace placeholders
- **Bash** - Create directories, initialize git

### Placeholder Replacement Strategy

1. Read entire file content
2. Perform all replacements at once
3. Write back to new location

```typescript
let content = readFileSync(templatePath, 'utf-8');
content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
content = content.replace(/\{\{WIDGET_NAME\}\}/g, widgetName);
content = content.replace(/\{\{TOOL_NAME\}\}/g, toolName);
content = content.replace(/\{\{TOOL_DESCRIPTION\}\}/g, toolDescription);
content = content.replace(/\{\{CURRENT_DATE\}\}/g, new Date().toISOString().split('T')[0]);
writeFileSync(targetPath, content);
```

### Special File Handling

**package.json files:**
- Parse as JSON
- Update name, description
- Stringify back with proper formatting

**TypeScript files with tool name:**
- Rename file from `{{TOOL_NAME}}.ts` to `greet_user.ts`
- Update imports in other files

## Testing the Generated Project

After generation, verify:

1. ✅ All files created
2. ✅ No remaining `{{PLACEHOLDERS}}`
3. ✅ Valid JSON in all `.json` files
4. ✅ Valid TypeScript syntax
5. ✅ Git initialized (if requested)
6. ✅ README has correct project name
7. ✅ WIDGET_SPEC has correct schemas

## Success Criteria

A successful generation means:
- Project directory created
- All template files copied
- All placeholders replaced
- Documentation generated
- Git initialized
- User can immediately run `npm install` and `npm run build`

## Example Invocation

```
User: "Generate a widget for LinkedIn post creation"

Claude (using this skill):
I'll create a LinkedIn post widget for you!

1. Project name: linkedin-poster
2. Widget name: LinkedIn Post Creator
3. Tool name: create_linkedin_post
4. Description: Creates and previews LinkedIn posts

[Generates project...]

✅ Project created: ./linkedin-poster
✅ Files generated: 42
✅ Git initialized
✅ Ready to deploy!

Next: cd linkedin-poster && cat README.md
```

---

**When this skill is invoked, follow these steps precisely and generate a production-ready ChatGPT widget project!**
