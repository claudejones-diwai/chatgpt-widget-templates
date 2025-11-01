# LinkedIn Post Composer Widget

Create, preview, and publish LinkedIn posts directly from ChatGPT with AI-powered content and image generation.

![Phase](https://img.shields.io/badge/Phase-1%20MVP-blue)
![Status](https://img.shields.io/badge/Status-Deployed-success)

## 🚀 Quick Start

### Add to ChatGPT

1. **Open ChatGPT Settings**
   - Go to ChatGPT → Settings → Personalization → Custom Instructions
   - Or use the MCP configuration if available in your ChatGPT version

2. **Add MCP Server Configuration**

```json
{
  "name": "LinkedIn Post Composer",
  "description": "Create, preview, and publish LinkedIn posts with AI assistance. Supports text posts and AI-generated images. Post to personal profile or company pages.",
  "url": "https://linkedin-post-composer-mcp.claude-8f5.workers.dev/mcp"
}
```

3. **Start Using**
   - Open ChatGPT
   - Say: "Help me create a LinkedIn post about [topic]"
   - ChatGPT will refine your content and open the composer widget

## 📝 Usage Examples

### Example 1: Text-Only Post
```
You: I want to share our team's progress on the new AI features we built this quarter

ChatGPT: [refines content and calls compose_linkedin_post]
→ Widget opens with polished content
→ Edit, preview, publish
```

### Example 2: Post with AI-Generated Image
```
You: Create a LinkedIn post about our product launch with a professional image

ChatGPT: [creates content + suggests image prompt]
→ Widget opens
→ Click "Generate with AI"
→ Edit prompt if needed
→ Generate image
→ Preview and publish
```

### Example 3: Company Page Post
```
You: Write a post for our company page about the new feature release

ChatGPT: [creates professional announcement]
→ Widget opens
→ Select company page from dropdown
→ Preview and publish
```

## 🎯 Features

### Phase 1 (Current) ✅
- ✅ **Text Posts** - Create and edit LinkedIn posts with character counter (3000 char limit)
- ✅ **AI Image Generation** - Generate professional images with DALL-E (Phase 1: stub/placeholder)
- ✅ **Account Selection** - Post to personal profile or company pages
- ✅ **Live Preview** - See exactly how your post will look on LinkedIn
- ✅ **Editable Prompts** - Modify AI image prompts and regenerate
- ✅ **Dark Mode** - Full dark/light theme support
- ✅ **Responsive Design** - Works on desktop and mobile

### Phase 2 (Planned) 🔮
- ⏳ **Real LinkedIn Integration** - OAuth + Posts API
- ⏳ **Real Image Generation** - DALL-E API integration
- ⏳ **Carousel Posts** - Multi-image posts (2-10 images)
- ⏳ **Video Posts** - Upload and share videos
- ⏳ **Document Posts** - Share PDFs and presentations
- ⏳ **Polls** - Create LinkedIn polls

### Phase 3 (Future) 🚀
- ⏳ **Post Scheduling** - Schedule posts for later
- ⏳ **Hashtag Suggestions** - AI-powered hashtag recommendations
- ⏳ **@Mentions** - Autocomplete for user mentions
- ⏳ **Analytics** - Track post performance

## 🔧 Technical Details

### Deployments
- **Widget**: https://linkedin-post-composer-widget.pages.dev
- **MCP Server**: https://linkedin-post-composer-mcp.claude-8f5.workers.dev
- **Health Check**: https://linkedin-post-composer-mcp.claude-8f5.workers.dev/health

### Architecture
```
ChatGPT
    ↓
MCP Server (Cloudflare Workers)
    ├── compose_linkedin_post (main tool)
    └── Server Actions
        ├── generate_image (DALL-E)
        ├── upload_image (R2)
        └── publish_post (LinkedIn API)
    ↓
React Widget (Cloudflare Pages)
    ├── Account Selector
    ├── Content Editor
    ├── Image Section
    ├── Post Preview
    └── Publish Workflow
```

### MCP Tools Available

#### Main Tool: `compose_linkedin_post`
Opens the LinkedIn Post Composer widget with ChatGPT-refined content.

**Input Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | Post text content (refined by ChatGPT) |
| `postType` | string | No | 'text' \| 'image' (default: 'text') |
| `imageSource` | string | Conditional | 'upload' \| 'ai-generate' \| 'url' |
| `suggestedImagePrompt` | string | Conditional | AI generation prompt (if imageSource='ai-generate') |
| `accountType` | string | No | 'personal' \| 'organization' (default: 'personal') |

**Annotations:**
- `readOnlyHint: true` - Auto-invokes widget on call
- `destructiveHint: false` - Safe to call
- `idempotentHint: true` - Same content = same state

#### Server Actions (Called by Widget)

**`generate_image`**
- Generates image using DALL-E (Phase 1: stub)
- Input: `prompt`, `style`, `size`
- Output: Image URL from R2 storage

**`upload_image`**
- Uploads user image to Cloudflare R2 (Phase 1: stub)
- Input: `image` (base64), `filename`
- Output: Image URL from R2 storage

**`publish_post`**
- Publishes post to LinkedIn (Phase 1: stub)
- Input: `accountId`, `content`, `imageUrl`, `postType`
- Output: Success message with post URL

## 📚 Documentation

- **[PRD.md](./PRD.md)** - Complete Product Requirements Document (1,200+ lines)
- **[API Documentation](./PRD.md#appendix-a-api-documentation-links)** - LinkedIn + OpenAI API docs
- **[Phase Implementation Plan](./PRD.md#4-phase-implementation-plan)** - Detailed roadmap

## 🛠️ Phase 1 Implementation Notes

### Current Behavior (Stubs)
All external API calls return **mock data** with clear messaging:

```typescript
// Example: Publish Post (Phase 1)
{
  "success": true,
  "postId": "urn:li:share:MOCK_123456789",
  "postUrl": "https://linkedin.com/feed/update/MOCK_123456789",
  "message": "✅ Published! (Mock data - see integration file for real API setup)"
}
```

### For Phase 2 Integration
Replace stubs in [mcp-server/src/integrations/linkedin-api.ts](./mcp-server/src/integrations/linkedin-api.ts):

1. **LinkedIn OAuth Setup**
   - Client ID + Secret: https://www.linkedin.com/developers/apps
   - Scopes: `w_member_social` (personal), `w_organization_social` (company)

2. **OpenAI API Key**
   - Get key: https://platform.openai.com/api-keys
   - Add to Cloudflare Worker environment: `OPENAI_API_KEY`

3. **Cloudflare R2 Storage**
   - Create bucket: `linkedin-post-images`
   - Add binding to wrangler.toml

## 🎨 UI Components

### Account Selector
- Dropdown with personal profile + company pages
- Visual icons (User icon for personal, Building icon for organizations)
- Live preview updates on selection

### Content Editor
- Auto-resizing textarea (4-12 rows)
- Character counter with visual warnings:
  - Green: 0-2700 chars
  - Yellow: 2700-3000 chars
  - Red: 3000+ chars (over limit)

### Image Section
- **Upload Image** button (Phase 2)
- **Generate with AI** button
  - Opens prompt editor
  - Min 10 chars, max 500 chars
  - Shows generation progress
  - Allows regeneration with edited prompt

### Post Preview
- LinkedIn-style card with:
  - Account avatar (auto-generated from initials)
  - Account name + headline
  - "Just now" timestamp
  - Post content (real-time sync)
  - Image preview (if added)
  - Engagement buttons (visual only)

### Publish Workflow
- **Success State**: Green banner with post URL link
- **Error State**: Red banner with retry button
- **Loading State**: Spinner with "Publishing..." message

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Widget loads with mock data
- [ ] Content is editable
- [ ] Character counter updates correctly
- [ ] Account selector shows all options
- [ ] Preview syncs in real-time
- [ ] Dark mode works correctly

### Image Features
- [ ] "Generate with AI" opens prompt editor
- [ ] Prompt validation works (10-500 chars)
- [ ] Generate button calls generate_image action
- [ ] Generated image displays in preview
- [ ] Regenerate button works with edited prompt
- [ ] Remove image button clears image

### Publish Flow
- [ ] Publish button disabled when content empty
- [ ] Publish button disabled when over 3000 chars
- [ ] Clicking publish calls publish_post action
- [ ] Success message shows with mock post URL
- [ ] Error handling works correctly

## 🚨 Known Limitations (Phase 1)

- ❌ No real LinkedIn API integration (stubs only)
- ❌ No real DALL-E image generation (placeholder images)
- ❌ No image upload functionality (coming in Phase 2)
- ❌ No draft persistence (publish immediately)
- ❌ No carousel/video/document posts
- ❌ No post scheduling
- ❌ No hashtag suggestions
- ❌ No @mentions autocomplete

## 📦 File Structure

```
examples/linkedin-post-composer/
├── README.md                        ← You are here
├── PRD.md                          ← Complete specifications (1,200+ lines)
├── .gitignore
├── shared-types/
│   ├── index.ts
│   ├── package.json
│   ├── tool-output.ts              ← TypeScript interfaces
│   └── tsconfig.json
├── mcp-server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml
│   └── src/
│       ├── index.ts                ← Main MCP server
│       ├── handlers/
│       │   ├── health.ts
│       │   └── info.ts
│       ├── tools/
│       │   └── compose_post.ts
│       ├── actions/
│       │   ├── generate-image.ts   ← DALL-E integration (stub)
│       │   ├── upload-image.ts     ← R2 upload (stub)
│       │   └── publish-post.ts     ← LinkedIn API (stub)
│       └── integrations/
│           └── linkedin-api.ts     ← All stubs here (replace for Phase 2)
└── widget-react/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx                 ← Main widget component
        ├── index.css
        ├── vite-env.d.ts
        ├── hooks/
        │   ├── index.ts
        │   ├── useTheme.ts
        │   ├── useToolData.ts
        │   └── useServerAction.ts  ← Server action hook
        └── components/
            ├── AccountSelector.tsx
            ├── ContentEditor.tsx
            ├── ImageSection.tsx
            ├── PostPreview.tsx
            └── ActionButtons.tsx
```

## 🤝 Contributing

This widget follows the **PRD-first development process**:

1. Read [PRD.md](./PRD.md) for complete specifications
2. All changes must align with PRD requirements
3. Update PRD if requirements change
4. Follow the established patterns in [widget-factory skill](../../.claude/skills/widget-factory/)

## 📄 License

MIT

---

**Built with:** React 19, TypeScript, Tailwind CSS, Framer Motion, Cloudflare Workers + Pages

**Generated with:** [Claude Code](https://claude.com/claude-code)
