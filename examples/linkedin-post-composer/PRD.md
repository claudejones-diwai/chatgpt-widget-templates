# ChatGPT Widget - Product Requirements Document

**Project:** LinkedIn Post Composer
**Version:** 1.0.0
**Status:** Phase 1 Complete (Mock Data)
**Created:** 2025-01-31
**Phase 1 Completed:** 2025-11-02
**Author:** Claude Jones

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [MCP Tools Specification](#2-mcp-tools-specification)
3. [Advanced Capabilities](#3-advanced-capabilities)
4. [Phase Implementation Plan](#4-phase-implementation-plan)
5. [Input Validation Rules](#5-input-validation-rules)
6. [UI/UX Specification](#6-uiux-specification)
7. [Dependencies & Technical Requirements](#7-dependencies--technical-requirements)
8. [Future Features](#8-future-features)
9. [Implementation Notes](#9-implementation-notes)
10. [Approval & Sign-off](#10-approval--sign-off)

---

## 1. Project Overview

### 1.1 Project Identity

**Project Name:** `linkedin-post-composer`
**Widget Title:** LinkedIn Post Composer
**Purpose:** Allows users to create, preview, and publish LinkedIn posts (personal or company page) directly from ChatGPT. Supports AI-assisted content iteration, image generation/upload, and live preview before publishing.

### 1.2 Key Features

**Phase 1 (MVP):**
- ✅ Create text-only posts
- ✅ Create posts with single image (upload OR AI-generated)
- ✅ Live preview of post
- ✅ Post to personal profile OR company page
- ✅ AI-powered image generation via DALL-E
- ✅ Editable image prompts
- ✅ Publish to LinkedIn

**Phase 2+ (Future):**
- ⏳ Carousel posts (2-10 images)
- ⏳ Video posts
- ⏳ Document posts (PDF, PPT)
- ⏳ Poll creation
- ⏳ Post scheduling
- ⏳ Hashtag suggestions
- ⏳ @Mentions autocomplete
- ⏳ Link previews
- ⏳ Post analytics

### 1.3 User Workflow

```
User chats with ChatGPT to refine post content
    ↓
User says "generate post" or "create LinkedIn post"
    ↓
ChatGPT calls compose_linkedin_post tool with refined content
    ↓
Widget opens with editable form + live preview
    ↓
User can:
  - Edit text content
  - Select personal/company account
  - Upload image OR generate with AI
  - Edit AI image prompt and regenerate
  - Preview how it looks on LinkedIn
    ↓
User clicks "Publish to LinkedIn"
    ↓
Widget shows success message with link to published post
```

---

## 2. MCP Tools Specification

### 2.1 Main Tool: `compose_linkedin_post`

**Purpose:** Opens the LinkedIn post composer widget with ChatGPT-refined content

#### Input Parameters

| Parameter | Type | Required | Description | Default | Phase |
|-----------|------|----------|-------------|---------|-------|
| `content` | string | Yes | Post text content (refined by ChatGPT) | - | 1 |
| `postType` | string | No | Type: 'text' \| 'image' \| 'carousel' \| 'video' \| 'document' \| 'poll' | 'text' | 1 |
| `imageSource` | string | Conditional* | How to get image: 'upload' \| 'ai-generate' \| 'url' | - | 1 |
| `imageUrl` | string | Conditional* | Direct image URL (if imageSource='url') | - | 1 |
| `suggestedImagePrompt` | string | Conditional* | AI generation prompt (if imageSource='ai-generate') | - | 1 |
| `accountType` | string | No | 'personal' \| 'organization' | 'personal' | 1 |
| `imageUrls` | string[] | Conditional | 2-10 image URLs for carousel | - | 2 |
| `videoUrl` | string | Conditional | Video URL for video posts | - | 2 |
| `documentUrl` | string | Conditional | Document URL for document posts | - | 2 |
| `pollQuestion` | string | Conditional | Poll question text | - | 2 |
| `pollOptions` | string[] | Conditional | 2-4 poll options | - | 2 |
| `scheduleTime` | string | No | ISO timestamp for scheduled posting | - | 3 |
| `hashtags` | string[] | No | Suggested hashtags | - | 3 |

***Conditional Requirements:** See [Section 5: Input Validation Rules](#5-input-validation-rules)

#### Output Structure

```typescript
export interface ComposeLinkedInPostOutput {
  // Content (editable in widget)
  content: string;
  postType: 'text' | 'image' | 'carousel' | 'video' | 'document' | 'poll';

  // Account selection (stub data for Phase 1)
  accounts: {
    personal: {
      id: string;              // URN: urn:li:person:MOCK_123
      name: string;
      profileUrl: string;
    };
    organizations: {
      id: string;              // URN: urn:li:organization:MOCK_456
      name: string;
      pageUrl: string;
    }[];
  };
  selectedAccountId: string;    // Default to personal.id

  // Image data (Phase 1)
  image?: {
    source: 'upload' | 'ai-generate' | 'url';
    url?: string;               // Generated or uploaded image URL
    prompt?: string;            // Editable AI generation prompt
  };

  // Future media types (Phase 2+)
  carousel?: {
    images: { url: string; alt?: string }[];
  };
  video?: {
    url?: string;
    thumbnail?: string;
  };
  document?: {
    url?: string;
    title?: string;
  };
  poll?: {
    question: string;
    options: string[];
    duration: number;           // Days: 1-14
  };

  // Widget configuration
  phase1Features: {
    allowImageUpload: boolean;
    allowAiGeneration: boolean;
  };
}
```

#### Annotations

| Annotation | Value | Reason |
|------------|-------|--------|
| `title` | "LinkedIn Post Composer" | Widget display name |
| `readOnlyHint` | `true` | Opens composer UI, doesn't publish immediately |
| `destructiveHint` | `false` | Just opens interface, no data changes |
| `idempotentHint` | `true` | Same content = same composer state |
| `openWorldHint` | `false` | Doesn't access external services on open |

#### Sample Data

```json
{
  "content": "Excited to share our progress on AI-powered tools! Here's what we've built this quarter:\n\n✅ Automated content generation\n✅ Smart scheduling system\n✅ Advanced analytics dashboard\n\nBuilding in public has been an incredible journey. What AI tools are you most excited about?",
  "postType": "image",
  "accounts": {
    "personal": {
      "id": "urn:li:person:MOCK_123",
      "name": "Claude Jones",
      "profileUrl": "https://linkedin.com/in/claudejones"
    },
    "organizations": [
      {
        "id": "urn:li:organization:MOCK_456",
        "name": "TechCorp AI",
        "pageUrl": "https://linkedin.com/company/techcorp-ai"
      },
      {
        "id": "urn:li:organization:MOCK_789",
        "name": "Innovation Labs",
        "pageUrl": "https://linkedin.com/company/innovation-labs"
      }
    ]
  },
  "selectedAccountId": "urn:li:person:MOCK_123",
  "image": {
    "source": "ai-generate",
    "url": null,
    "prompt": "Professional tech workspace with AI elements, modern design, blue and orange color scheme, minimalist style"
  },
  "phase1Features": {
    "allowImageUpload": true,
    "allowAiGeneration": true
  }
}
```

---

### 2.2 Server Action: `generate_image`

**Purpose:** Generate image using DALL-E based on user's editable prompt

#### Input Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `prompt` | string | Yes | Image generation prompt (user-editable) | - |
| `style` | string | No | 'professional' \| 'creative' \| 'minimalist' | 'professional' |
| `size` | string | No | '1024x1024' \| '1792x1024' \| '1024x1792' | '1024x1024' |

#### Output Structure

```typescript
export interface GenerateImageOutput {
  success: boolean;
  imageUrl?: string;      // Public URL from Cloudflare R2 storage
  imageKey?: string;      // Storage key for future cleanup
  error?: string;
}
```

#### Implementation (Phase 1 - Stub)

```typescript
// Returns mock data for Phase 1
// Phase 2: Integrate real OpenAI DALL-E API + Cloudflare R2
{
  "success": true,
  "imageUrl": "https://mock-storage.com/generated-image-123.png",
  "imageKey": "linkedin-posts/1735689600000-abc123.png"
}
```

---

### 2.3 Server Action: `upload_image`

**Purpose:** Upload user's image to Cloudflare R2 storage

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | file/base64 | Yes | Image file or base64 data |
| `filename` | string | Yes | Original filename |

#### Output Structure

```typescript
export interface UploadImageOutput {
  success: boolean;
  imageUrl?: string;      // Public URL from R2
  imageKey?: string;      // Storage key
  error?: string;
}
```

#### Validation Rules

- **File types:** jpg, jpeg, png, gif, webp
- **Max size:** 10MB
- **Dimensions:** Min 400x400px, Max 7680x4320px (8K)

---

### 2.4 Server Action: `publish_post`

**Purpose:** Publish post to LinkedIn via Posts API

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `accountId` | string | Yes | URN of account/org to post to |
| `content` | string | Yes | Post text content |
| `imageUrl` | string | No | URL of image to include |
| `postType` | string | Yes | 'text' \| 'image' |

#### Output Structure

```typescript
export interface PublishPostOutput {
  success: boolean;
  postId?: string;        // LinkedIn post URN
  postUrl?: string;       // Public URL to view published post
  message: string;        // Success/error message
  error?: string;
}
```

#### Implementation (Phase 1 - Stub)

```json
{
  "success": true,
  "postId": "urn:li:share:MOCK_789",
  "postUrl": "https://linkedin.com/feed/update/urn:li:share:MOCK_789",
  "message": "✅ Post published successfully!\n\n⚠️ Using mock data. To integrate real LinkedIn API:\n1. Set up LinkedIn OAuth (w_member_social scope)\n2. Replace stub in mcp-server/src/integrations/linkedin-api.ts\n3. See PRD.md for API documentation links"
}
```

---

## 3. Advanced Capabilities

### 3.1 Selected Capabilities

Based on requirements analysis:

- ☐ **Navigation** - Not needed (single-page interface)
- ☐ **State Persistence** - Not needed (publish immediately, no drafts in Phase 1)
- ☑ **Server Actions** - YES (generate_image, upload_image, publish_post)
- ☐ **Chat Integration** - Not needed (widget is self-contained)

### 3.2 Server Actions Configuration

#### Action 1: Generate Image

```typescript
{
  toolName: 'generate_image',
  trigger: 'button',
  buttonLabel: 'Generate Image',
  inputMapping: [
    {
      paramName: 'prompt',
      source: 'form-field',
      sourceValue: 'imagePromptInput'  // User-editable textarea
    },
    {
      paramName: 'style',
      source: 'widget-state',
      sourceValue: 'selectedImageStyle'
    },
    {
      paramName: 'size',
      source: 'constant',
      sourceValue: '1024x1024'
    }
  ],
  onComplete: 'refresh'  // Update widget with generated image
}
```

#### Action 2: Upload Image

```typescript
{
  toolName: 'upload_image',
  trigger: 'button',
  buttonLabel: 'Upload Image',
  inputMapping: [
    {
      paramName: 'image',
      source: 'form-field',
      sourceValue: 'imageFileInput'  // File picker
    },
    {
      paramName: 'filename',
      source: 'form-field',
      sourceValue: 'imageFileInput.name'
    }
  ],
  onComplete: 'refresh'
}
```

#### Action 3: Publish Post

```typescript
{
  toolName: 'publish_post',
  trigger: 'form-submit',
  buttonLabel: 'Publish to LinkedIn',
  inputMapping: [
    {
      paramName: 'accountId',
      source: 'widget-state',
      sourceValue: 'selectedAccountId'
    },
    {
      paramName: 'content',
      source: 'form-field',
      sourceValue: 'postContentTextarea'
    },
    {
      paramName: 'imageUrl',
      source: 'widget-state',
      sourceValue: 'currentImageUrl'
    },
    {
      paramName: 'postType',
      source: 'widget-state',
      sourceValue: 'postType'
    }
  ],
  onComplete: 'message'  // Show success message
}
```

---

## 4. Phase Implementation Plan

### Phase 1: MVP (Current) ✅ COMPLETE

**Status:** ✅ **COMPLETE** (2025-11-02)
**Timeline:** Weeks 1-2
**Scope:** Basic text + single image posting

**Completion Summary:**
Phase 1 is fully implemented with complete UI/UX using mock data. All features are functional and ready for user testing. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for detailed implementation notes, architectural decisions, and lessons learned.

**What Works:**
- Complete Edit/Preview tab interface
- Account selection (personal + organizations)
- Content editing with character count
- Image upload with client-side preview
- AI image generation prompt editor
- Publish flow with success/error states
- Toast notifications for async operations
- Dark mode support
- All validation rules

**What's Stubbed (Real APIs in Phase 2):**
- LinkedIn OAuth → Using mock account data
- DALL-E API → Returns placeholder images
- Cloudflare R2 upload → Uses data URLs for preview
- LinkedIn Publishing API → Returns mock success

| Feature | Status | Notes |
|---------|--------|-------|
| Text-only posts | ✅ Phase 1 | Core feature |
| Single image (upload) | ✅ Phase 1 | File picker, client-side preview (R2 in Phase 2) |
| Single image (AI) | ✅ Phase 1 | Prompt editor UI complete (DALL-E API in Phase 2) |
| Account selection | ✅ Phase 1 | Personal + organizations (mock data) |
| Live preview | ✅ Phase 1 | LinkedIn-style preview with tabs |
| Edit/Preview tabs | ✅ Phase 1 | Complete interaction flow |
| Publish to LinkedIn | ✅ Phase 1 | Complete flow (API stub → real API in Phase 2) |
| Success/error states | ✅ Phase 1 | Hide form after success, show message |
| Toast notifications | ✅ Phase 1 | Async operation feedback |
| Character validation | ✅ Phase 1 | 3000 char limit with visual feedback |
| File validation | ✅ Phase 1 | Type and size checks |
| LinkedIn OAuth | ⏳ Phase 2 | Currently using mock accounts |
| Real DALL-E API | ⏳ Phase 2 | Currently returns placeholders |
| Real R2 Storage | ⏳ Phase 2 | Currently uses data URLs |
| Real LinkedIn API | ⏳ Phase 2 | Currently returns mock success |

### Phase 2: Rich Media ⏳

**Timeline:** Weeks 3-4
**Scope:** Carousel, video, documents, polls

| Feature | Status | Dependencies |
|---------|--------|--------------|
| Image carousel (2-10) | ⏳ Phase 2 | Multi-upload UI |
| Video posts | ⏳ Phase 2 | Video upload + processing |
| Document posts | ⏳ Phase 2 | PDF/PPT upload |
| Poll creation | ⏳ Phase 2 | Poll UI + validation |
| Real LinkedIn API | ⏳ Phase 2 | OAuth integration |
| Real DALL-E API | ⏳ Phase 2 | OpenAI API key |

### Phase 3: Advanced Features ⏳

**Timeline:** Weeks 5-6
**Scope:** Scheduling, analytics, enhancements

| Feature | Status | Dependencies |
|---------|--------|--------------|
| Post scheduling | ⏳ Phase 3 | Backend job queue |
| Hashtag suggestions | ⏳ Phase 3 | AI-powered suggestions |
| @Mentions autocomplete | ⏳ Phase 3 | LinkedIn search API |
| Link previews | ⏳ Phase 3 | URL metadata fetching |
| Post analytics | ⏳ Phase 3 | LinkedIn Analytics API |
| Draft persistence | ⏳ Phase 3 | Backend database |

---

## 5. Input Validation Rules

### 5.1 Conditional Requirements

#### Rule 1: Image Source Required for Image Posts

```typescript
if (postType === 'image') {
  // MUST provide ONE of:
  imageSource: 'upload' | 'ai-generate' | 'url'

  // Additional requirements based on source:
  if (imageSource === 'ai-generate') {
    required: suggestedImagePrompt (string, 10-500 chars)
  }
  if (imageSource === 'url') {
    required: imageUrl (valid URL, accessible image)
  }
  if (imageSource === 'upload') {
    // User will upload via widget file picker
  }
}
```

#### Rule 2: Carousel Requirements

```typescript
if (postType === 'carousel') {
  required: imageUrls (array, 2-10 items)
  validation: each URL must be valid, accessible image
}
```

#### Rule 3: Video Requirements

```typescript
if (postType === 'video') {
  required: videoUrl (valid URL, accessible video)
  optional: videoThumbnail (valid image URL)
  validation: video format (mp4, mov, avi)
  validation: max size 200MB
}
```

#### Rule 4: Poll Requirements

```typescript
if (postType === 'poll') {
  required: pollQuestion (string, 5-140 chars)
  required: pollOptions (array, 2-4 items, each 1-25 chars)
  optional: pollDuration (number, 1-14 days, default: 7)
}
```

### 5.2 Content Validation

| Field | Min | Max | Pattern | Required |
|-------|-----|-----|---------|----------|
| `content` | 1 char | 3000 chars | Any text | Yes |
| `suggestedImagePrompt` | 10 chars | 500 chars | Descriptive text | Conditional |
| `pollQuestion` | 5 chars | 140 chars | Question format | Conditional |
| `pollOptions[n]` | 1 char | 25 chars | Short text | Conditional |

### 5.3 Error Messages

```typescript
const VALIDATION_ERRORS = {
  MISSING_IMAGE_SOURCE: "Please specify how to add an image: upload, generate with AI, or provide URL",
  MISSING_IMAGE_PROMPT: "Please provide a prompt for AI image generation",
  MISSING_IMAGE_URL: "Please provide a valid image URL",
  CONTENT_TOO_SHORT: "Post content must be at least 1 character",
  CONTENT_TOO_LONG: "Post content must be 3000 characters or less",
  INVALID_POST_TYPE: "Post type must be one of: text, image, carousel, video, document, poll",
  CAROUSEL_TOO_FEW: "Carousel must have at least 2 images",
  CAROUSEL_TOO_MANY: "Carousel can have at most 10 images",
  POLL_TOO_FEW_OPTIONS: "Poll must have at least 2 options",
  POLL_TOO_MANY_OPTIONS: "Poll can have at most 4 options",
};
```

---

## 6. UI/UX Specification

### 6.1 Visual References

- **LinkedIn Post Creation Screen** (provided screenshot)
- **Layout inspiration:** LinkedIn's native composer
- **Design system:** LinkedIn's visual language (blues, professional styling)

### 6.2 Layout Structure

**Chosen Pattern:** Option A - Inline edit with preview below

```
┌──────────────────────────────────────────────┐
│ LinkedIn Post Composer                       │
├──────────────────────────────────────────────┤
│                                              │
│ Post as: [Personal Profile ▼]               │
│          Claude Jones                        │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ What would you like to share?            ││
│ │                                          ││
│ │ [User's editable post content here]     ││
│ │                                          ││
│ │                                          ││
│ └──────────────────────────────────────────┘│
│ 0 / 3000 characters                          │
│                                              │
│ ─── Add to your post ────────────────────   │
│                                              │
│ [📷 Upload Image]  [✨ Generate with AI]    │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ Image Prompt (editable):                 ││
│ │ Professional tech workspace with AI...   ││
│ │ [Regenerate]                             ││
│ │                                          ││
│ │ [Generated image preview]                ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ─── Preview ─────────────────────────────   │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ 👤 Claude Jones                          ││
│ │ Product Manager at TechCorp AI           ││
│ │ Just now • 🌐                            ││
│ │                                          ││
│ │ [User's post content preview]            ││
│ │                                          ││
│ │ [Image preview if added]                 ││
│ │                                          ││
│ │ 👍 Like  💬 Comment  🔁 Repost  📤 Send ││
│ └──────────────────────────────────────────┘│
│                                              │
│          [Cancel]  [Publish to LinkedIn]     │
│                                              │
└──────────────────────────────────────────────┘
```

### 6.3 Key Components

#### Component 1: Account Selector
- **Type:** Dropdown
- **Options:** Personal profile + company pages
- **Default:** Personal profile
- **Data source:** `accounts` from toolData
- **On change:** Updates preview with selected account name/avatar

#### Component 2: Content Editor
- **Type:** Textarea with auto-resize
- **Placeholder:** "What would you like to share?"
- **Max length:** 3000 characters
- **Character counter:** Live count below textarea
- **Styling:** LinkedIn-style input (minimal border, focus state)

#### Component 3: Image Section
**Sub-components:**
- **Upload button:** Opens file picker (jpg, png, max 10MB)
- **Generate button:** Shows prompt input modal
- **Prompt editor:** Textarea (editable, pre-filled by ChatGPT)
- **Regenerate button:** Visible after image generated
- **Image preview:** Displays uploaded/generated image with remove option

#### Component 4: Post Preview
- **Profile header:** Avatar (mock) + name + headline
- **Timestamp:** "Just now"
- **Content:** Real-time preview of textarea content
- **Image:** Shows uploaded/generated image
- **Engagement icons:** Like, Comment, Repost, Send (non-functional, visual only)

#### Component 5: Action Buttons
- **Cancel:** Closes widget
- **Publish:** Primary CTA (blue, LinkedIn brand color)
  - Disabled if content empty
  - Shows loading spinner during publish
  - Shows success message after publish

### 6.4 User Interactions

| User Action | Trigger | Widget Response | Backend Call |
|-------------|---------|-----------------|--------------|
| Types in textarea | onChange event | Updates character count<br>Updates preview in real-time | None |
| Selects account | Dropdown change | Updates preview header with account info | None |
| Clicks "Upload Image" | Button click | Opens file picker | None |
| Selects file | File input change | Shows loading → calls upload_image → displays preview | `upload_image` |
| Clicks "Generate with AI" | Button click | Shows prompt modal with editable prompt | None |
| Clicks "Generate" in modal | Button click | Shows loading → calls generate_image → displays preview | `generate_image` |
| Edits image prompt | Text input change | Enables "Regenerate" button | None |
| Clicks "Regenerate" | Button click | Shows loading → calls generate_image → displays new preview | `generate_image` |
| Clicks "Publish" | Button click | Shows loading → calls publish_post → shows success | `publish_post` |
| Publish succeeds | API response | Shows success message with link to post | None |
| Publish fails | API error | Shows error message with retry option | None |

### 6.5 States & Feedback

#### Loading State
```
┌────────────────────────┐
│  ⏳ Loading...         │
└────────────────────────┘
```

#### Generating Image
```
┌────────────────────────────────────┐
│  ✨ Generating image...            │
│  [Progress spinner]                │
│  This may take a few seconds       │
└────────────────────────────────────┘
```

#### Publishing
```
┌────────────────────────────────────┐
│  📤 Publishing to LinkedIn...      │
│  [Progress spinner]                │
└────────────────────────────────────┘
```

#### Success
```
┌────────────────────────────────────┐
│  ✅ Published successfully!        │
│                                    │
│  View your post:                   │
│  🔗 linkedin.com/feed/update/...   │
│                                    │
│  [Close]                           │
└────────────────────────────────────┘
```

#### Error
```
┌────────────────────────────────────┐
│  ❌ Failed to publish              │
│                                    │
│  Error: [Error message here]       │
│                                    │
│  [Retry]  [Cancel]                 │
└────────────────────────────────────┘
```

### 6.6 Responsive Design

**Desktop (>768px):**
- Full width layout (max 600px centered)
- Preview always visible below editor

**Mobile (<768px):**
- Stack vertically
- Preview collapses to toggle (Edit | Preview tabs)
- Full-width buttons

---

## 7. Dependencies & Technical Requirements

### 7.1 Standard Dependencies (Always Included)

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "~5.7.2",
  "tailwindcss": "^3.4.16",
  "vite": "^6.4.1",
  "lucide-react": "^0.468.0"
}
```

### 7.2 Additional Dependencies

| Package | Version | Purpose | Phase |
|---------|---------|---------|-------|
| `framer-motion` | ^11.15.0 | Smooth transitions for preview updates | 1 |
| `react-textarea-autosize` | ^8.5.3 | Auto-resizing textarea | 1 |

### 7.3 Cloudflare Worker Environment Variables

```bash
# Phase 1 (Optional - using stubs)
# OPENAI_API_KEY=sk-...           # For DALL-E image generation

# Phase 2 (Required for real integration)
OPENAI_API_KEY=sk-...             # OpenAI API key for DALL-E
LINKEDIN_CLIENT_ID=...            # LinkedIn OAuth client ID
LINKEDIN_CLIENT_SECRET=...        # LinkedIn OAuth client secret
R2_BUCKET_NAME=linkedin-images    # Cloudflare R2 bucket name
```

### 7.4 Cloudflare R2 Storage

**Bucket Configuration:**
- **Name:** `linkedin-post-images`
- **Region:** Auto (Cloudflare global)
- **Public access:** Yes (via custom domain or R2.dev)
- **Lifecycle policy:** Delete files after 30 days (Phase 2)

**File structure:**
```
linkedin-posts/
  ├── {timestamp}-{uuid}.png       # Generated images
  ├── {timestamp}-{uuid}.jpg       # Uploaded images
  └── ...
```

### 7.5 APIs Used

#### Phase 1 (Stubs)
- All APIs return mock data with TODO comments

#### Phase 2+ (Real Integration)

**OpenAI DALL-E API:**
- Endpoint: `https://api.openai.com/v1/images/generations`
- Model: `dall-e-3`
- Documentation: https://platform.openai.com/docs/guides/images

**LinkedIn Posts API:**
- Endpoint: `https://api.linkedin.com/rest/posts`
- Protocol: JSON-RPC 2.0
- Headers: `X-Restli-Protocol-Version: 2.0.0`
- Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

**LinkedIn Images API:**
- Endpoint: `https://api.linkedin.com/rest/images`
- Purpose: Upload images for posts
- Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api

**LinkedIn OAuth:**
- Scopes: `w_member_social` (personal), `w_organization_social` (company)
- Documentation: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access

### 7.6 Browser Compatibility

**Target:** Modern browsers within ChatGPT iframe
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not needed:** Legacy browser support (ChatGPT handles compatibility)

---

## 8. Future Features

### 8.1 Phase 2 Features

#### Carousel Posts
```typescript
interface CarouselConfig {
  images: {
    url: string;
    alt?: string;          // Accessibility text
    order: number;         // Display order 1-10
  }[];
  allowReorder: boolean;   // Drag-to-reorder in widget
}
```

**UI Changes:**
- Multi-image uploader with drag-drop
- Thumbnail carousel in widget
- Reorder functionality

#### Video Posts
```typescript
interface VideoConfig {
  url: string;
  thumbnail?: string;      // Auto-generated or custom
  duration?: number;       // Seconds
  uploadProgress?: number; // 0-100 during upload
}
```

**UI Changes:**
- Video upload with progress bar
- Thumbnail selection
- Video preview player

#### Document Posts
```typescript
interface DocumentConfig {
  url: string;
  title: string;           // Display title
  description?: string;
  thumbnail?: string;      // PDF first page preview
  pageCount?: number;
}
```

**UI Changes:**
- Document upload (PDF, PPT)
- First page thumbnail preview
- Title/description editor

#### Poll Creation
```typescript
interface PollConfig {
  question: string;
  options: string[];       // 2-4 options
  duration: number;        // 1-14 days
  allowMultiple: boolean;  // Phase 3
}
```

**UI Changes:**
- Poll question editor
- Dynamic option adder (2-4 options)
- Duration selector

### 8.2 Phase 3 Features

#### Post Scheduling
```typescript
interface ScheduleConfig {
  scheduledTime: string;   // ISO timestamp
  timezone: string;
  status: 'scheduled' | 'published' | 'failed';
}
```

**Requirements:**
- Backend job queue (Cloudflare Workers Cron)
- Scheduled posts database
- Cancel/edit scheduled posts

#### Hashtag Suggestions
```typescript
interface HashtagSuggestion {
  tag: string;             // Without # prefix
  relevance: number;       // 0-1 score
  reach?: number;          // Estimated impressions
}
```

**Implementation:**
- AI analyzes post content
- Suggests 5-10 relevant hashtags
- User selects which to include

#### @Mentions Autocomplete
```typescript
interface MentionSuggestion {
  id: string;              // LinkedIn user/org URN
  name: string;
  headline: string;
  avatarUrl: string;
}
```

**Implementation:**
- LinkedIn search API integration
- Autocomplete dropdown in textarea
- @ trigger for search

#### Link Previews
```typescript
interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  domain: string;
}
```

**Implementation:**
- Auto-detect URLs in content
- Fetch Open Graph metadata
- Show preview card in post

#### Post Analytics
```typescript
interface PostAnalytics {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
}
```

**Requirements:**
- LinkedIn Analytics API access
- Separate "View Analytics" widget
- Historical data storage

### 8.3 Advanced Enhancements

#### Draft Management (Phase 3)
- Backend database for drafts
- `list_drafts` tool shows saved drafts
- Resume editing any draft
- Auto-save every 30 seconds

#### Multi-Account Management (SaaS)
- User connects multiple LinkedIn accounts
- Switch between accounts
- Default account preference
- OAuth token management

#### Post Templates (Phase 3)
- Save frequently used formats
- Template library
- Merge fields for dynamic content

#### Collaboration (Phase 4)
- Share draft with team
- Approval workflow
- Comments on drafts

---

## 9. Implementation Notes

### 9.1 Phase 1 Stub Implementation

All external API calls return mock data with clear TODO comments:

```typescript
// mcp-server/src/integrations/linkedin-api.ts

/**
 * ⚠️ PHASE 1 STUB - Replace with real LinkedIn API
 *
 * Documentation:
 * - Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
 * - OAuth Setup: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
 * - Required Scopes: w_member_social, w_organization_social
 */
export async function publishToLinkedIn(post: LinkedInPost) {
  console.log('STUB: Would publish to LinkedIn:', post);

  return {
    success: true,
    postId: `urn:li:share:MOCK_${Date.now()}`,
    postUrl: `https://linkedin.com/feed/update/MOCK_${Date.now()}`,
    message: '✅ Published! (Mock data - see mcp-server/src/integrations/linkedin-api.ts to integrate real API)'
  };
}

/**
 * ⚠️ PHASE 1 STUB - Replace with real OpenAI API
 *
 * Documentation:
 * - DALL-E API: https://platform.openai.com/docs/guides/images
 * - Required: OPENAI_API_KEY environment variable
 */
export async function generateImage(prompt: string) {
  console.log('STUB: Would generate image with prompt:', prompt);

  return {
    success: true,
    imageUrl: 'https://via.placeholder.com/1024x1024/3b82f6/ffffff?text=AI+Generated+Image',
    imageKey: `mock-${Date.now()}.png`
  };
}
```

### 9.2 File Structure

```
examples/linkedin-post-composer/
├── PRD.md                           ← This document
├── .gitignore
├── shared-types/
│   └── tool-output.ts              ← TypeScript interfaces
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
│           └── linkedin-api.ts     ← LinkedIn API client (stub)
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
        │   ├── useServerAction.ts  ← NEW: For server actions
        │   └── ...
        └── components/
            ├── AccountSelector.tsx
            ├── ContentEditor.tsx
            ├── ImageSection.tsx
            ├── PostPreview.tsx
            └── ActionButtons.tsx
```

### 9.3 Testing Checklist

**Phase 1 - MVP:**
- [ ] Widget loads with mock data
- [ ] Content editor is editable
- [ ] Character counter updates
- [ ] Account selector shows options
- [ ] Upload button opens file picker
- [ ] Generate button shows prompt modal
- [ ] Image prompt is editable
- [ ] Regenerate button works
- [ ] Preview updates in real-time
- [ ] Dark mode works
- [ ] Publish button shows success message
- [ ] Success message includes mock post URL
- [ ] Widget builds without TypeScript errors
- [ ] MCP server deploys to Cloudflare
- [ ] Widget deploys to Cloudflare Pages

**Phase 2 - Real Integration:**
- [ ] LinkedIn OAuth flow works
- [ ] Real accounts load from API
- [ ] DALL-E generates real images
- [ ] Images upload to R2
- [ ] Post publishes to LinkedIn
- [ ] Published post appears on LinkedIn
- [ ] Image cleanup works

### 9.4 Known Limitations

**Phase 1:**
- ❌ No real LinkedIn integration (stubs only)
- ❌ No real image generation (placeholder images)
- ❌ No image storage (mock URLs)
- ❌ No draft persistence
- ❌ No multi-image carousel
- ❌ No video/document posts

**Phase 2:**
- ❌ No post scheduling
- ❌ No hashtag suggestions
- ❌ No @mentions autocomplete
- ❌ No analytics

**Technical Constraints:**
- Max post length: 3000 characters (LinkedIn limit)
- Max image size: 10MB
- Max carousel: 10 images
- Supported image formats: jpg, png, gif, webp
- Supported video formats: mp4, mov, avi

### 9.5 Security Considerations

**OAuth Tokens:**
- Store in Cloudflare KV (encrypted)
- Never expose in client-side code
- Refresh tokens before expiration

**Image Upload:**
- Validate file type on backend
- Scan for malware (Phase 2)
- Limit file size (10MB)
- Generate unique filenames (prevent overwrites)

**API Keys:**
- Store in Cloudflare environment variables
- Never commit to git
- Rotate regularly

**Rate Limiting:**
- LinkedIn API: 100 requests/day (Development tier)
- DALL-E API: Based on OpenAI account tier
- Implement exponential backoff on errors

---

## 10. Approval & Sign-off

### 10.1 PRD Status

| Version | Date | Status | Author | Approver |
|---------|------|--------|--------|----------|
| 1.0.0 | 2025-01-31 | Draft | Claude Jones | - |

### 10.2 Review Checklist

- [ ] All requirements clearly defined
- [ ] Input/output structures complete
- [ ] Validation rules specified
- [ ] UI/UX mockups provided
- [ ] Dependencies identified
- [ ] Phase plan agreed
- [ ] API integrations documented
- [ ] Security reviewed
- [ ] Testing plan defined

### 10.3 Approval

**Reviewed by:** _________________
**Date:** _________________
**Approved:** ☐ Yes  ☐ No  ☐ Needs Changes

**Comments:**
```
[Approval comments here]
```

---

## Appendix A: API Documentation Links

**LinkedIn:**
- Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- Images API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api
- OAuth: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
- Organization Lookup: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/organization-lookup-api

**OpenAI:**
- DALL-E API: https://platform.openai.com/docs/guides/images
- API Reference: https://platform.openai.com/docs/api-reference/images

**Cloudflare:**
- R2 Storage: https://developers.cloudflare.com/r2/
- Workers: https://developers.cloudflare.com/workers/
- KV: https://developers.cloudflare.com/kv/

## Appendix B: Design References

- LinkedIn UI patterns: https://www.linkedin.com
- LinkedIn brand colors: #0A66C2 (primary blue), #FFF (white), #000 (text)
- Typography: System fonts (LinkedIn uses -apple-system, BlinkMacSystemFont, "Segoe UI")

---

**END OF PRD**
