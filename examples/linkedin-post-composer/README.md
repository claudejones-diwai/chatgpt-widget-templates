# LinkedIn Post Composer Widget

Create, preview, and publish LinkedIn posts directly from ChatGPT with AI-powered content and image generation.

![Phase](https://img.shields.io/badge/Phase-2%20Complete-success)
![Status](https://img.shields.io/badge/Status-Production-success)

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

### Phase 1 & 2 (Complete) ✅
- ✅ **Text Posts** - Create and edit LinkedIn posts with character counter (3000 char limit)
- ✅ **AI Image Generation** - Generate professional images with DALL-E 3
- ✅ **Account Selection** - Post to personal profile or company pages
- ✅ **Live Preview** - See exactly how your post will look on LinkedIn
- ✅ **Editable Prompts** - Modify AI image prompts and regenerate
- ✅ **Dark Mode** - Full dark/light theme support
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Real LinkedIn Integration** - OAuth + UGC Posts API
- ✅ **Image Upload** - Upload images from your device
- ✅ **Cloudflare R2 Storage** - Permanent image hosting
- ✅ **Organization Posting** - Post to company pages you admin

### Phase 3 (Future) 🔮
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

## 🛠️ Phase 2 Setup Instructions

### Prerequisites
You need to set up the following integrations for full functionality:

### 1. LinkedIn OAuth Setup

**Create LinkedIn Developer App:**
1. Go to https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in app details and create

**Add Required Products:**

Your app needs these two products:

1. **Share on LinkedIn** (Default Tier)
   - Grants: `w_member_social` (personal posting)
   - Status: Auto-approved

2. **Advertising API** (Development Tier)
   - Grants: `w_organization_social`, `r_organization_social` (company page posting)
   - Status: Requires request (usually auto-approved)
   - Click "Request access" and fill out the form

**Get Credentials:**
1. Go to your app → Auth tab
2. Copy:
   - Client ID
   - Client Secret
3. Add to Cloudflare Workers:
   ```bash
   wrangler secret put LINKEDIN_CLIENT_ID
   wrangler secret put LINKEDIN_CLIENT_SECRET
   ```

**Authenticate:**
1. Visit: https://linkedin-post-composer-mcp.claude-8f5.workers.dev/oauth/linkedin
2. Grant permissions (including organization access)
3. You'll be redirected back with success message

### 2. OpenAI API Key (DALL-E)

1. Get API key: https://platform.openai.com/api-keys
2. Add to Cloudflare Worker:
   ```bash
   wrangler secret put OPENAI_API_KEY
   ```

### 3. Cloudflare R2 Storage

1. Create R2 bucket:
   ```bash
   wrangler r2 bucket create linkedin-post-images
   ```
2. Bucket binding already configured in `wrangler.toml`

### 4. Cloudflare KV Namespace

1. Create KV namespace:
   ```bash
   wrangler kv:namespace create OAUTH_TOKENS
   ```
2. Add namespace ID to `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "OAUTH_TOKENS"
   id = "YOUR_NAMESPACE_ID"
   ```

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

## 🚨 Current Limitations

- ⏳ No draft persistence (posts publish immediately)
- ⏳ No carousel/video/document posts (Phase 3)
- ⏳ No post scheduling (Phase 3)
- ⏳ No hashtag suggestions (Phase 3)
- ⏳ No @mentions autocomplete (Phase 3)
- ⏳ Single-tenant mode (one LinkedIn account per deployment)

## 🔧 Troubleshooting

### Company Pages Not Showing in Dropdown

**Problem:** Dropdown only shows personal account, not company pages.

**Solution:**
1. Verify you have admin access to company pages on LinkedIn
2. Check OAuth scopes include `rw_organization_admin`
3. Re-authenticate:
   ```bash
   # Clear old token
   npx wrangler kv key delete "linkedin:{YOUR_USER_ID}" --binding=OAUTH_TOKENS --remote

   # Visit OAuth URL to re-authenticate
   # https://linkedin-post-composer-mcp.claude-8f5.workers.dev/oauth/linkedin
   ```
4. Ensure you approved organization permissions during OAuth

### Image Generation Fails

**Problem:** "Failed to generate image" or OpenAI errors.

**Common Causes:**
- **Content Policy Violation**: Prompt violates OpenAI's content policy
  - **Solution**: Modify the prompt to be more general/appropriate
- **Rate Limiting**: Too many requests in short time
  - **Solution**: Wait 30-60 seconds and try again
- **API Key Issues**: Invalid or missing OpenAI API key
  - **Solution**: Verify `OPENAI_API_KEY` secret is set correctly

**What to do:**
1. Click "Try Again" in the error message
2. If error persists, edit the image prompt to be more descriptive/appropriate
3. Use "Upload Image" instead if AI generation continues to fail

### Publishing to Company Page Fails

**Problem:** "Bad Request" error when publishing to organization.

**Solution:**
- Ensure you selected the correct company page from dropdown
- Verify the company page exists and you have admin access
- Check that `w_organization_social` scope is approved
- Try publishing to personal profile first to verify API connectivity

### Image Upload Not Working

**Problem:** Upload image button doesn't work or shows errors.

**Solution:**
- Verify image is JPG, PNG, GIF, or WebP format
- Check file size is reasonable (< 5MB recommended)
- Ensure Cloudflare R2 bucket is configured correctly in `wrangler.toml`

**How it works:**
1. Widget converts uploaded image to base64 data URI
2. Server automatically detects data URI and uploads to R2
3. R2 returns permanent URL
4. Image is then uploaded to LinkedIn with proper ownership

**Note:** The upload flow now handles both AI-generated images (already in R2) and user-uploaded images (base64 data URIs) automatically.

## 🔒 Privacy & Security

### Data Handling

**OAuth Tokens:**
- Stored in Cloudflare KV (encrypted at rest)
- Scoped to minimum required permissions (`w_member_social`, `w_organization_social`)
- Never exposed to client-side code
- Automatically expire based on LinkedIn's token lifetime

**Image Storage:**
- Generated/uploaded images stored in Cloudflare R2 with public URLs
- Images accessible via: `https://linkedin-post-composer-mcp.claude-8f5.workers.dev/images/*`
- Retention: Images retained indefinitely unless manually deleted
- Recommended: Implement cleanup policy for old images

**Post Content:**
- Post text never stored on our servers
- Content passes directly from ChatGPT → Widget → LinkedIn
- No analytics or tracking of post content

### Content Security Policy (CSP)

The widget operates with strict CSP restrictions:

**Allowed Domains:**
- `connect_domains`: `api.openai.com`, `api.linkedin.com`, `linkedin-post-composer-mcp.claude-8f5.workers.dev`
- `resource_domains`: `linkedin-post-composer-mcp.claude-8f5.workers.dev` (for R2 images)

**Security Measures:**
- Sandboxed iframe execution
- No access to privileged browser APIs
- Server-side input validation and sanitization
- Rate limiting via LinkedIn/OpenAI API quotas

### Rate Limiting

**DALL-E Image Generation:**
- Limited by OpenAI API quotas (varies by plan)
- Recommended: Implement request throttling for production

**LinkedIn Publishing:**
- Limited by LinkedIn API rate limits
- Personal accounts: ~100 posts/day
- Organization accounts: Varies by tier

### Data Retention Policy

**What We Store:**
- OAuth tokens (until expiration or user revocation)
- Generated images (indefinitely in R2)

**What We DON'T Store:**
- Post content or drafts
- User browsing behavior
- Analytics or usage metrics
- Personal information beyond OAuth profile

**User Rights:**
- Revoke access: Disconnect app in LinkedIn settings
- Delete images: Contact deployment administrator
- Data export: OAuth tokens can be exported from KV

### Recommended Production Changes

1. **Add Token Refresh**: Implement automatic OAuth token refresh (currently TODO in [linkedin.ts:136](mcp-server/src/integrations/linkedin.ts#L136))
2. **Image Cleanup**: Add R2 lifecycle policy to delete images older than 90 days
3. **Rate Limiting**: Implement server-side request throttling
4. **Audit Logging**: Log all publish events for compliance
5. **Multi-Tenant**: Isolate user data with proper KV key namespacing

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
│       │   ├── generate-image.ts   ← DALL-E image generation
│       │   ├── upload-image.ts     ← R2 image upload
│       │   └── publish-post.ts     ← LinkedIn publishing
│       ├── integrations/
│       │   ├── dalle.ts            ← OpenAI DALL-E 3 integration
│       │   ├── linkedin-posts-api.ts ← LinkedIn UGC Posts API
│       │   └── r2-storage.ts       ← Cloudflare R2 storage
│       └── oauth/
│           └── linkedin.ts         ← LinkedIn OAuth flow
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
