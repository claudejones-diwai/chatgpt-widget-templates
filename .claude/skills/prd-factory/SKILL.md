---
name: prd-factory
description: Guide users through creating comprehensive PRDs for ChatGPT widgets. Use when defining requirements before widget implementation.
version: 1.0.0
---

# PRD Factory

Guides users through creating comprehensive Product Requirements Documents (PRDs) for ChatGPT widget projects. This skill ensures all requirements are gathered systematically before code generation.

## When to Use This Skill

Use this skill when:
- User wants to create a new ChatGPT widget
- User has a widget idea but needs to define requirements
- User wants to document widget specifications before implementation
- User needs to plan widget architecture and features

**DO NOT use this skill when:**
- User already has a complete PRD
- User wants to generate code directly (use `widget-factory` instead)
- User is asking about existing widgets

## Workflow Overview

```
User Idea → PRD Factory Skill → Complete PRD → Widget Factory Skill → Generated Widget
```

This skill produces a PRD that serves as input to the `widget-factory` skill.

## Question Framework

Guide the user through these sections systematically:

### Section 1: Project Identity

**Questions to Ask:**

1. **Widget Name**: What should we call this widget?
   - Example: "LinkedIn Post Composer", "Email Inbox Viewer", "Location Finder"
   - Use kebab-case for project names (e.g., `linkedin-post-composer`)

2. **Purpose**: What is the main purpose of this widget in one sentence?
   - Example: "Help users compose and publish LinkedIn posts with AI-generated images"

3. **Target Users**: Who will use this widget and in what context?
   - Example: "Marketing professionals creating LinkedIn content via ChatGPT"

**Output Template:**
```markdown
# ChatGPT Widget - Product Requirements Document

**Project:** {Widget Name}
**Version:** 1.0.0
**Status:** Draft
**Date:** {Current Date}

## 1. Project Overview

### 1.1 Project Identity
- **Widget Name**: {kebab-case-name}
- **Tool Name**: {snake_case_name}
- **Purpose**: {One sentence description}
- **Target Users**: {User description}
```

### Section 2: User Workflow

**Questions to Ask:**

1. **Trigger**: How does the user initiate the widget?
   - Example: "User asks ChatGPT to 'compose a LinkedIn post about {topic}'"

2. **Key Steps**: What are the main steps in the user workflow?
   - Example:
     1. User requests post composition
     2. ChatGPT generates draft content
     3. Widget opens with pre-filled content
     4. User edits and previews post
     5. User publishes to LinkedIn

3. **Success Outcome**: What does successful completion look like?
   - Example: "Post is published to LinkedIn and user sees success confirmation"

**Output Template:**
```markdown
### 1.2 Key Features
- {List main features}

### 1.3 User Workflow
1. {Step 1}
2. {Step 2}
3. {Step 3}
...
```

### Section 3: MCP Tools Specification

**Questions to Ask:**

1. **Main Tool Name**: What should the primary MCP tool be called?
   - Use snake_case (e.g., `compose_linkedin_post`, `view_inbox`, `find_location`)

2. **Tool Description**: What will ChatGPT see when it lists this tool?
   - This is what triggers ChatGPT to use the tool
   - Example: "Compose and publish a LinkedIn post with optional AI-generated images"

3. **Input Parameters**: What data does the tool need from ChatGPT?
   - For each parameter:
     - Name (snake_case)
     - Type (string, number, boolean, array, object)
     - Description
     - Required or optional?
     - Default value (if optional)
     - Validation rules

4. **Output Data**: What structured data will the tool return to the widget?
   - Define the complete data structure
   - Include all fields needed by the UI

**Output Template:**
```markdown
## 2. MCP Tools Specification

### 2.1 Main Tool: `{tool_name}`

**Tool Annotations:**
```json
{
  "title": "{Widget Title}",
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true,
  "openWorldHint": false
}
```

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "{param_name}": {
      "type": "{type}",
      "description": "{Description for ChatGPT}"
    }
  },
  "required": ["{required_params}"]
}
```

**Output Structure:**
```typescript
interface {ToolName}Output {
  // Define complete output structure
}
```
```

### Section 4: Advanced Capabilities (Server Actions)

**Questions to Ask:**

1. **Does the widget need to perform async operations?**
   - Examples: Generate images, upload files, publish posts, fetch external data

2. **For each server action:**
   - Action name (snake_case)
   - Purpose
   - Input parameters
   - Output structure
   - Success/error handling

**Common Server Action Patterns:**

- **AI Generation**: `generate_{resource}` (e.g., `generate_image`, `generate_suggestions`)
- **File Upload**: `upload_{resource}` (e.g., `upload_image`, `upload_attachment`)
- **Publish/Submit**: `publish_{resource}` or `submit_{resource}`
- **Fetch External**: `fetch_{resource}` or `get_{resource}`

**Output Template:**
```markdown
## 3. Advanced Capabilities

### 3.1 Server Actions

#### Server Action: `{action_name}`

**Purpose**: {What this action does}

**Input Parameters:**
```typescript
interface {ActionName}Args {
  // Input structure
}
```

**Output:**
```typescript
interface {ActionName}Output {
  success: boolean;
  message: string;
  // Additional output fields
}
```

**Stub Implementation:**
```typescript
export async function handle{ActionName}(args: {ActionName}Args): Promise<{ActionName}Output> {
  // Phase 1: Return mock data
  return {
    success: true,
    message: "Operation completed (mock)",
  };
}
```
```

### Section 5: UI/UX Specification

**Questions to Ask:**

1. **Widget Type**: What pattern best fits this widget?
   - **Form-Based**: User fills in fields (e.g., email composer)
   - **Data Display**: Show structured content (e.g., inbox viewer)
   - **Interactive Map**: Location-based (e.g., place finder)
   - **Edit/Preview**: Content creation with preview (e.g., post composer)
   - **Custom**: Combination or novel pattern

2. **Layout Structure**: What are the main UI sections?
   - Header
   - Navigation/Tabs
   - Main content area
   - Sidebar (if needed)
   - Footer/Action buttons

3. **Key Components**: What specific UI elements are needed?
   - Forms (text inputs, dropdowns, checkboxes)
   - Lists (simple, filterable, sortable)
   - Cards
   - Buttons (primary, secondary, icon)
   - Modals/Dialogs
   - Toast notifications
   - Loading states
   - Error states
   - Success states

4. **Interactions**: What can users do?
   - Edit text
   - Upload files
   - Select options
   - Toggle views
   - Trigger actions (save, publish, delete)
   - Navigate between sections

5. **Validation**: What input validation is needed?
   - Character limits
   - Required fields
   - Format validation (email, URL, etc.)
   - File type/size restrictions

**Output Template:**
```markdown
## 4. UI/UX Specification

### 4.1 Widget Type
{Pattern name and description}

### 4.2 Layout Structure

**ASCII Mockup:**
```
┌─────────────────────────────────────┐
│         {Widget Title}              │
├─────────────────────────────────────┤
│ [Tab 1] [Tab 2]                     │
├─────────────────────────────────────┤
│                                     │
│  {Main Content Area}                │
│                                     │
├─────────────────────────────────────┤
│             [Action Button]         │
└─────────────────────────────────────┘
```

### 4.3 Components

**{Component Name}**
- Purpose: {Description}
- States: {loading, error, success, empty}
- Props: {List key props}

### 4.4 Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| {field} | {rule} | {message} |
```

### Section 6: Phase Planning

**Questions to Ask:**

1. **What is the MVP (Phase 1)?**
   - Which features are essential for initial release?
   - What can be stubbed with mock data?
   - What requires real API integration?

2. **What comes in Phase 2?**
   - Real API integrations
   - OAuth flows
   - File storage
   - Advanced features

3. **What are Phase 3+ features?**
   - Nice-to-have enhancements
   - Analytics
   - Advanced customization

**Output Template:**
```markdown
## 5. Phase Implementation Plan

### Phase 1: MVP with Mock Data
**Goal**: Functional UI/UX with realistic mock data

**Features:**
- [ ] {Feature 1}
- [ ] {Feature 2}

**Stubs:**
- `{server_action_1}`: Returns mock success
- `{server_action_2}`: Returns sample data

### Phase 2: Real API Integration
**Goal**: Connect to actual services

**Features:**
- [ ] {Real API feature 1}
- [ ] {Real API feature 2}

**Requirements:**
- {API credentials}
- {OAuth setup}
- {Storage setup}

### Phase 3: Enhancements
**Goal**: Polish and advanced features

**Features:**
- [ ] {Enhancement 1}
- [ ] {Enhancement 2}
```

### Section 7: Technical Requirements

**Questions to Ask:**

1. **Dependencies**: What external services or APIs are needed?
   - OAuth providers
   - AI services (DALL-E, Claude, etc.)
   - Storage services (Cloudflare R2, AWS S3)
   - Third-party APIs (LinkedIn, Twitter, etc.)

2. **Environment Variables**: What configuration is needed?
   - API keys
   - OAuth credentials
   - Service endpoints
   - Feature flags

3. **Cloudflare Setup**: What Cloudflare resources are needed?
   - Workers (for MCP server)
   - Pages (for widget hosting)
   - R2 buckets (for file storage)
   - KV namespaces (for session data)

**Output Template:**
```markdown
## 6. Dependencies & Technical Requirements

### 6.1 External Services
- **{Service Name}**: {Purpose}
  - API Docs: {URL}
  - Auth Method: {OAuth/API Key}
  - Required Scopes: {List scopes}

### 6.2 Environment Variables

**MCP Server (wrangler.toml secrets):**
```bash
{VAR_NAME} = "Description"
```

**Widget (Vite environment variables):**
```bash
VITE_{VAR_NAME} = "Description"
```

### 6.3 Cloudflare Resources
- **Worker**: `{project-name}-mcp`
- **Pages Project**: `{project-name}`
- **R2 Bucket**: `{project-name}-uploads` (if file storage needed)
```

## Decision Trees

### Pattern Selection Guide

**Use Form-Based Pattern when:**
- Primary goal is data collection
- User needs to fill multiple fields
- Data is submitted to external service
- Example: Email composer, survey builder

**Use Data Display Pattern when:**
- Primary goal is showing information
- Data comes from external source
- Minimal user input needed
- Example: Inbox viewer, analytics dashboard

**Use Interactive Map Pattern when:**
- Widget involves locations
- Visual map representation adds value
- User needs to select places
- Example: Store locator, event finder

**Use Edit/Preview Pattern when:**
- User creates content (text, posts, documents)
- Preview before publishing is important
- Multiple editing steps required
- Example: Post composer, document editor

### Server Actions Decision Tree

**Q: Does the widget need server actions?**

If YES to any:
- Generate AI content (images, text, suggestions)
- Upload files to storage
- Publish/submit to external services
- Fetch data from APIs during widget interaction

Then add server actions.

**Q: How many server actions?**

Typical patterns:
- **Content Creator**: 2-3 actions (generate, upload, publish)
- **Data Fetcher**: 1-2 actions (fetch, refresh)
- **Simple Form**: 1 action (submit)

### UI Complexity Guide

**Simple UI (1-2 components):**
- Single form or list
- No tabs or navigation
- Minimal state management
- Example: URL shortener, simple calculator

**Medium UI (3-5 components):**
- Multiple sections or tabs
- Some state management
- 1-2 server actions
- Example: Email composer, todo list

**Complex UI (6+ components):**
- Multiple views/tabs
- Complex state management
- 3+ server actions
- External service integration
- Example: LinkedIn post composer, CRM dashboard

## Template: Complete PRD

Here's a reference template based on the LinkedIn Post Composer example:

```markdown
# ChatGPT Widget - Product Requirements Document

**Project:** {Widget Name}
**Version:** 1.0.0
**Status:** Draft
**Date:** {Date}

## 1. Project Overview

### 1.1 Project Identity
- **Widget Name**: {kebab-case-name}
- **Tool Name**: {snake_case_name}
- **Purpose**: {One sentence}
- **Target Users**: {Description}

### 1.2 Key Features
- {Feature 1}
- {Feature 2}
- {Feature 3}

### 1.3 User Workflow
1. {Step 1}
2. {Step 2}
3. {Step 3}

## 2. MCP Tools Specification

### 2.1 Main Tool: `{tool_name}`

**Tool Annotations:**
[See Section 3 for details]

**Input Schema:**
[Define parameters]

**Output Structure:**
[TypeScript interface]

### 2.2 Server Action: `{action_name}` (if needed)
[Repeat for each server action]

## 3. Advanced Capabilities

### 3.1 Server Actions
[Document each server action with stub implementation]

## 4. UI/UX Specification

### 4.1 Widget Type
[Pattern name]

### 4.2 Layout Structure
[ASCII mockup]

### 4.3 Components
[List and describe each component]

### 4.4 Validation Rules
[Table of validation rules]

### 4.5 User Interactions
[Describe interaction flows]

## 5. Phase Implementation Plan

### Phase 1: MVP with Mock Data
[Features and stubs]

### Phase 2: Real API Integration
[Real features and requirements]

### Phase 3: Enhancements
[Future features]

## 6. Dependencies & Technical Requirements

### 6.1 External Services
[List services and APIs]

### 6.2 Environment Variables
[Document all config]

### 6.3 Cloudflare Resources
[List Workers, Pages, R2, KV]

## 7. Implementation Notes

### 7.1 TypeScript Types
[Shared types location and structure]

### 7.2 Stub Patterns
[Example stub implementations]

### 7.3 Testing Considerations
[How to test without real APIs]
```

## Integration with Widget Factory

After completing the PRD using this skill, the user should:

1. **Save the PRD**: `examples/{project-name}/PRD.md`

2. **Invoke Widget Factory**: Use the `widget-factory` skill with the completed PRD

3. **Widget Factory will:**
   - Read the PRD
   - Generate project structure
   - Create MCP server with tool definitions
   - Create React widget matching UI spec
   - Implement server actions as stubs (Phase 1)
   - Set up deployment configuration
   - Generate documentation

## Validation Checklist

Before considering the PRD complete, verify:

- [ ] Project identity clearly defined
- [ ] User workflow documented step-by-step
- [ ] MCP tool has complete input/output schemas
- [ ] All server actions documented with stubs
- [ ] UI/UX pattern selected and justified
- [ ] ASCII mockups show layout structure
- [ ] All components listed with descriptions
- [ ] Validation rules documented
- [ ] Phase plan separates MVP from enhancements
- [ ] All external dependencies identified
- [ ] Environment variables documented
- [ ] Cloudflare resources specified
- [ ] PRD is clear enough for code generation

## Example PRDs

Reference these complete PRDs as examples:

1. **[LinkedIn Post Composer](../../examples/linkedin-post-composer/PRD.md)** - Complex widget with Edit/Preview tabs, server actions, file upload
2. **Priority Inbox** - Data display widget with filtering
3. **Playa Guide** - Interactive map widget with location data
4. **Email Composer** - Form-based widget with templates

## Tips for Success

**Ask Clarifying Questions:**
- "What happens if the user cancels?"
- "What should the error message say?"
- "How should we handle loading states?"
- "What's the character limit?"

**Think About Edge Cases:**
- Empty states
- Error states
- Loading states
- Network failures
- Validation errors
- User permissions

**Plan for Phases:**
- Don't try to build everything at once
- Start with mock data (Phase 1)
- Add real APIs later (Phase 2)
- Polish and enhance (Phase 3)

**Be Specific:**
- Exact field names
- Exact error messages
- Exact validation rules
- Exact button labels

**Use Examples:**
- Show example inputs
- Show example outputs
- Show example error messages
- Reference existing widgets

## Common Pitfalls to Avoid

1. **Vague Requirements**: "The user edits some text" → "User edits post content in a textarea with 3000 character limit"

2. **Missing Validation**: Document all validation rules upfront

3. **Unclear Phases**: Be explicit about what's mock vs. real

4. **Missing Server Actions**: If the widget does async operations, document the server actions

5. **No Error Handling**: Plan for what happens when things fail

6. **Incomplete Schemas**: Define every field in input/output structures

7. **UI Without Mockups**: Always include ASCII mockups for layout

## Quick Start Example

**User**: "I want to create a widget for managing my todo list"

**You (PRD Factory)**:
"Great! Let's create a comprehensive PRD for your todo list widget. I'll guide you through the requirements.

**Project Identity**

1. What should we call this widget?
   - Suggestion: 'Task Manager' or 'Todo List Manager'

2. In one sentence, what's the main purpose?
   - Example: 'Help users manage daily tasks with priorities and due dates'

3. Who will use this and in what context?
   - Example: 'Professionals tracking work tasks via ChatGPT'

[Continue through all sections systematically...]"

After gathering all requirements, produce a complete PRD document that can be used by the `widget-factory` skill to generate the widget code.
