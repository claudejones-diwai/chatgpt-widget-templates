# LinkedIn Post Composer - Implementation Notes

**Status:** Phase 1 Complete (Mock Data)
**Version:** 1.0.0
**Last Updated:** 2025-11-02

## Overview

This document captures implementation details, lessons learned, and architectural decisions from building the LinkedIn Post Composer widget.

## Architecture Decisions

### Edit/Preview Tab Pattern

**Decision:** Separate editing and preview into distinct views with tab navigation.

**Rationale:**
- Users need to see how their post will look before publishing
- Editing UI requires different controls than preview
- Clear separation of concerns (edit mode vs. read mode)
- Better mobile experience (full screen for each mode)

**Implementation:**
- Single `viewMode` state: `'edit' | 'preview'`
- Conditional rendering based on `viewMode`
- Context-aware action buttons (See Preview vs. Back/Publish)
- Tab navigation with visual active state

**Files:**
- [src/App.tsx:10](widget-react/src/App.tsx#L10) - ViewMode type definition
- [src/App.tsx:118-143](widget-react/src/App.tsx#L118-L143) - Tab navigation
- [src/App.tsx:146-193](widget-react/src/App.tsx#L146-L193) - Conditional views

### Server Actions Pattern

**Decision:** Use server actions for AI generation, file upload, and publishing.

**Rationale:**
- Operations happen after initial widget load
- Need async feedback to user
- Clean separation between MCP tool (initial) and actions (subsequent)
- Reusable pattern for future widgets

**Implementation:**
- Custom `useServerAction` hook manages state and execution
- Each action returns structured output with `success` flag
- Async operation tracking with "wasX" pattern
- Toast notifications on completion

**Server Actions:**
1. `generate_image` - AI image generation via DALL-E (Phase 2)
2. `upload_image` - File upload to Cloudflare R2 (Phase 2)
3. `publish_post` - Publish to LinkedIn API (Phase 2)

**Files:**
- [widget-react/src/hooks/useServerAction.ts](widget-react/src/hooks/useServerAction.ts) - Hook implementation
- [mcp-server/src/index.ts:124-152](mcp-server/src/index.ts#L124-L152) - Server action routing
- [mcp-server/src/tools/](mcp-server/src/tools/) - Action handlers

### Async Operation Tracking

**Problem:** How to detect when async operations complete and trigger side effects (toast notifications, UI changes)?

**Attempted Solutions:**

1. **Auto-dismiss timers** - Failed due to state changes clearing timeouts
2. **Complex acknowledgment state** - Failed due to edge cases and inconsistent behavior

**Final Solution:** "wasX" state pattern

```typescript
const [wasGenerating, setWasGenerating] = useState(false);

useEffect(() => {
  if (generateImage.loading) {
    setWasGenerating(true);
  } else if (wasGenerating) {
    setWasGenerating(false);
    // Operation just completed - trigger side effects
    setShowToast(true);
    setShowEditor(false);
  }
}, [generateImage.loading, wasGenerating]);
```

**Why This Works:**
- Detects transition from loading → complete
- Reliable trigger for side effects
- No race conditions with timeouts
- User has control (manual dismiss)

**Files:**
- [widget-react/src/components/ImageSection.tsx:36-68](widget-react/src/components/ImageSection.tsx#L36-L68) - Pattern implementation

### Toast Notifications

**Decision:** Manual dismiss with close button (no auto-dismiss).

**Rationale:**
- Auto-dismiss with timeouts proved unreliable
- User should control when notification disappears
- Notifications may contain important info worth reading
- Simpler implementation, fewer edge cases

**Implementation:**
- Fixed position overlay (center of screen)
- Success/error/info variants
- Close button with X icon
- `min-w-[320px]` and `whitespace-nowrap` prevent wrapping

**Files:**
- [widget-react/src/components/ImageSection.tsx:137-156](widget-react/src/components/ImageSection.tsx#L137-L156) - Toast component (inline)

### Success State Pattern

**Decision:** Hide entire form after successful publish, show compact success message.

**Rationale:**
- Clear visual confirmation of completion
- Reduces UI clutter after action is done
- User can't accidentally edit/republish
- Compact layout reduces widget height

**Implementation:**
- Conditional rendering: `{!publishPost.result?.success && (...)}`
- Dynamic container height: `min-h-screen` → `min-h-fit`
- Success message includes link to published post
- Error state allows retry

**Files:**
- [widget-react/src/App.tsx:102](widget-react/src/App.tsx#L102) - Dynamic height
- [widget-react/src/App.tsx:115-194](widget-react/src/App.tsx#L115-L194) - Conditional form
- [widget-react/src/App.tsx:197-227](widget-react/src/App.tsx#L197-L227) - Success state

### No Close/Cancel Buttons

**Decision:** Remove all close and cancel buttons from widget.

**Rationale:**
- ChatGPT manages widget lifecycle
- `window.close()` doesn't work in sandboxed iframe
- Official examples have no close buttons
- User closes widget via ChatGPT UI

**Investigation:**
- Tested `window.close()` - no effect in iframe
- Reviewed `window.openai` API - no close method
- Checked official examples - none have close buttons
- Confirmed with user via screenshot

**Files Changed:**
- Removed close button from header
- Removed cancel button from footer
- Removed confirmation dialog

## Component Architecture

### Main Components

**App.tsx** - Root component
- Manages view mode state
- Coordinates server actions
- Handles tab navigation
- Conditional rendering of success/error states

**AccountSelector.tsx** - Account selection
- Personal account + organization accounts
- Visual account cards with icons
- Selected state indication

**ContentEditor.tsx** - Text content editing
- Textarea with character count
- Real-time validation
- Visual feedback for limits

**ImageSection.tsx** - Image management
- Three states: no image, has image, editing prompt
- AI generation with prompt editor
- File upload with validation
- Remove image functionality
- Async operation tracking
- Toast notifications

**PostPreview.tsx** - LinkedIn-style preview
- Mimics LinkedIn post appearance
- Account name and timestamp
- Content with whitespace preservation
- Optional image display

### Custom Hooks

**useServerAction** - Server action execution
- Generic hook for any server action
- Manages loading, result, error states
- Executes MCP JSON-RPC calls
- Returns execute function + state

**useToolData** - MCP data consumption
- Generic hook for tool output
- Type-safe with TypeScript generics
- Auto-updates when data changes

**useTheme** - Dark mode detection
- Reads from `window.openai.theme`
- Returns `'light' | 'dark'`
- Enables dark mode styling

## Shared Types

All types are defined in `shared-types/` to ensure consistency between MCP server and React widget.

### Key Interfaces

```typescript
// Main tool output
interface ComposeLinkedInPostOutput {
  accounts: {
    personal: LinkedInAccount;
    organizations: LinkedInAccount[];
  };
  content: string;
  selectedAccountId: string;
  postType: 'text' | 'image';
  image?: {
    source: 'ai-generate' | 'upload' | 'url';
    url?: string;
    prompt?: string;
  };
  suggestedImagePrompt?: string;
  phase1Features: {
    allowAiGeneration: boolean;
    allowFileUpload: boolean;
  };
}

// Server action outputs
interface GenerateImageOutput {
  success: boolean;
  message: string;
  imageUrl?: string;
  error?: string;
}

interface PublishPostOutput {
  success: boolean;
  message: string;
  postUrl?: string;
  postId?: string;
  error?: string;
}
```

## Phase 1 Implementation (Mock Data)

### Approach

Phase 1 focuses on complete UI/UX with realistic mock data:

- All UI components fully functional
- All interactions work as expected
- Mock data simulates real API responses
- Stub server actions return success
- Client-side validation in place

### Mock Data Patterns

**Account Data:**
```typescript
personal: {
  id: "user-123",
  name: "Your Name",
  type: "personal"
}
```

**Image Generation (Stub):**
```typescript
return {
  success: true,
  message: "Image generated successfully (mock)",
  imageUrl: "https://via.placeholder.com/1024x1024"
};
```

**Publish Post (Stub):**
```typescript
return {
  success: true,
  message: "Your post has been published successfully! (Mock)",
  postUrl: "https://linkedin.com/posts/mock-post-id",
  postId: "mock-post-id-123"
};
```

### What Works in Phase 1

- Edit/Preview tabs
- Content editing with validation
- Account selection
- Image prompt editor
- Image upload (preview only, no storage)
- Publishing (mock success)
- Toast notifications
- Success/error states
- Dark mode
- All UI components

### What's Stubbed

- AI image generation (returns placeholder)
- File upload to storage (uses data URL)
- LinkedIn API publishing (returns mock success)

## Phase 2 Plan (Real API Integration)

### LinkedIn OAuth

**Requirements:**
- LinkedIn App registration
- OAuth 2.0 flow
- Scopes: `w_member_social`, `r_liteprofile`
- Store access tokens securely

**Implementation:**
```typescript
// OAuth flow
1. User clicks "Connect LinkedIn"
2. Redirect to LinkedIn OAuth
3. User authorizes
4. Receive access token
5. Store in Cloudflare KV
6. Use token for API calls
```

### DALL-E Integration

**Requirements:**
- OpenAI API key
- DALL-E 3 API access
- Error handling for rate limits
- Cost tracking

**Implementation:**
```typescript
const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: args.prompt,
    size: args.size,
    quality: "standard",
    n: 1
  })
});
```

### Cloudflare R2 Storage

**Requirements:**
- R2 bucket: `linkedin-post-composer-uploads`
- Public access for image URLs
- File cleanup strategy

**Implementation:**
```typescript
const key = `${Date.now()}-${fileName}`;
await env.R2_BUCKET.put(key, buffer, {
  httpMetadata: {
    contentType: fileType
  }
});
const imageUrl = `https://r2-domain/${key}`;
```

### LinkedIn Publishing API

**Requirements:**
- LinkedIn API credentials
- Member ID from OAuth
- Post creation endpoint
- Image upload (if included)

**Implementation:**
```typescript
// 1. Upload image (if present)
if (imageUrl) {
  const uploadResponse = await fetch(
    `https://api.linkedin.com/v2/assets?action=registerUpload`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: `urn:li:person:${memberId}`,
          serviceRelationships: [{
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent"
          }]
        }
      })
    }
  );
}

// 2. Create post
const postResponse = await fetch(
  `https://api.linkedin.com/v2/ugcPosts`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      author: `urn:li:person:${memberId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: imageUrl ? "IMAGE" : "NONE",
          media: imageUrl ? [{
            status: "READY",
            media: imageAssetUrn
          }] : []
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    })
  }
);
```

## Lessons Learned

### 1. Start with UI/UX, Not API Integration

**Lesson:** Building complete UI with mock data first allowed us to:
- Perfect the user experience
- Discover edge cases
- Iterate quickly without API limits
- Get user feedback early

**Recommendation:** Always do Phase 1 (mock) before Phase 2 (real APIs).

### 2. Async Operation Tracking Pattern

**Lesson:** Simple "wasX" state pattern is more reliable than:
- Auto-dismiss timers
- Complex acknowledgment tracking
- Multiple state flags

**Recommendation:** Use this pattern for any async operation that needs UI feedback.

### 3. No Close Buttons in Widgets

**Lesson:** ChatGPT widgets cannot close themselves.
- `window.close()` doesn't work
- No close method in `window.openai` API
- ChatGPT controls lifecycle

**Recommendation:** Never add close/cancel buttons. Show success state and let ChatGPT handle closure.

### 4. Success State Should Replace Form

**Lesson:** After successful completion:
- Hide the entire form
- Show compact success message
- Adjust container height to `min-h-fit`
- Provide link to result (if applicable)

**Recommendation:** Use success state pattern for all widgets with submission flows.

### 5. Toast Notifications Need Manual Dismiss

**Lesson:** Auto-dismiss with timeouts is unreliable in React due to:
- State changes clearing timeouts
- Re-renders affecting timing
- Edge cases with multiple operations

**Recommendation:** Always provide manual dismiss button. User controls when notification goes away.

### 6. Type Safety with Shared Types

**Lesson:** Defining types in `shared-types/` ensures:
- MCP server and widget use same structure
- TypeScript catches mismatches
- Refactoring is safer
- Documentation is built-in

**Recommendation:** Always create shared types directory for all interfaces.

### 7. Server Actions Need Clear Success/Error

**Lesson:** Every server action should return:
- `success: boolean` - Clear success/failure
- `message: string` - User-friendly feedback
- Additional data based on action

**Recommendation:** Standardize server action output format across all widgets.

## Testing Approach

### Phase 1 Testing (Current)

**Manual Testing:**
- Edit tab interactions
- Preview tab display
- Account switching
- Content editing with limits
- Image prompt editor
- Image upload
- Publish flow
- Success/error states
- Dark mode toggle
- Toast notifications

**Validation Testing:**
- 3000 character limit
- File size limits (5MB)
- File type validation (images only)
- Empty content handling
- Account selection required

### Phase 2 Testing (Future)

**API Integration:**
- LinkedIn OAuth flow
- DALL-E API calls
- R2 upload/storage
- LinkedIn publish API
- Error handling for all APIs
- Rate limit handling
- Token expiry handling

**End-to-End:**
- Complete flow from ChatGPT
- Real post creation
- Image generation + upload
- Published post verification

## Performance Considerations

### Current Performance

- Fast initial load (no API calls)
- Instant tab switching
- Responsive interactions
- Small bundle size (~150KB)

### Phase 2 Considerations

- Image generation: 10-30 seconds (DALL-E 3)
- File upload: Depends on file size
- LinkedIn API: 1-2 seconds
- Loading states for all async operations
- Error recovery for timeouts

## Deployment

### Current Deployment

**Widget:** Cloudflare Pages
- URL: `https://linkedin-post-composer.pages.dev`
- Build: `npm run build` in `widget-react/`
- Deploy: `npx wrangler pages deploy dist --project-name=linkedin-post-composer`

**MCP Server:** Cloudflare Workers
- URL: `https://linkedin-post-composer-mcp.{account}.workers.dev`
- Build: `npm run build` in `mcp-server/`
- Deploy: `npx wrangler deploy`

### Phase 2 Deployment Additions

**Environment Variables (Secrets):**
```bash
# MCP Server
wrangler secret put OPENAI_API_KEY
wrangler secret put LINKEDIN_CLIENT_ID
wrangler secret put LINKEDIN_CLIENT_SECRET

# Widget (Vite)
VITE_LINKEDIN_REDIRECT_URI=...
```

**Cloudflare Resources:**
```bash
# Create R2 bucket
wrangler r2 bucket create linkedin-post-composer-uploads

# Create KV namespace for tokens
wrangler kv:namespace create "TOKENS"
```

**wrangler.toml additions:**
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "linkedin-post-composer-uploads"

[[kv_namespaces]]
binding = "TOKENS"
id = "..."
```

## File Structure

```
linkedin-post-composer/
├── PRD.md                          # Requirements document
├── IMPLEMENTATION.md               # This file
├── shared-types/
│   └── index.ts                    # Shared TypeScript interfaces
├── mcp-server/
│   ├── src/
│   │   ├── index.ts                # Main MCP server
│   │   ├── handlers/
│   │   │   ├── health.ts           # Health check
│   │   │   └── info.ts             # Server info
│   │   └── tools/
│   │       ├── compose_linkedin_post.ts
│   │       ├── generate_image.ts
│   │       ├── upload_image.ts
│   │       └── publish_post.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml
└── widget-react/
    ├── src/
    │   ├── App.tsx                 # Main app component
    │   ├── main.tsx                # Entry point
    │   ├── index.css               # Global styles
    │   ├── vite-env.d.ts           # Type definitions
    │   ├── components/
    │   │   ├── AccountSelector.tsx
    │   │   ├── ContentEditor.tsx
    │   │   ├── ImageSection.tsx
    │   │   └── PostPreview.tsx
    │   └── hooks/
    │       ├── index.ts            # Hook exports
    │       ├── useServerAction.ts  # Server action hook
    │       ├── useTheme.ts         # Theme detection
    │       └── useToolData.ts      # MCP data hook
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── index.html
```

## Dependencies

### MCP Server
- `@cloudflare/workers-types` - TypeScript types
- `typescript` - Type checking
- `wrangler` - Deployment

### Widget
- `react` ^19.0.0 - UI library
- `react-dom` ^19.0.0 - React DOM
- `lucide-react` - Icons
- `vite` - Build tool
- `tailwindcss` - Styling
- `typescript` - Type checking

## Next Steps

1. **Test Phase 1 thoroughly** - Ensure all UI/UX is perfect
2. **Get user feedback** - Validate the experience
3. **Plan Phase 2 API integration** - Set up accounts and credentials
4. **Implement LinkedIn OAuth** - User authentication
5. **Integrate DALL-E** - Real image generation
6. **Set up Cloudflare R2** - File storage
7. **Implement LinkedIn API** - Real publishing
8. **End-to-end testing** - Verify complete flow
9. **Documentation update** - Reflect Phase 2 changes

## References

- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [OpenAI DALL-E API](https://platform.openai.com/docs/guides/images)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [ChatGPT Widget Examples](https://github.com/openai/openai-apps-sdk-examples)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
