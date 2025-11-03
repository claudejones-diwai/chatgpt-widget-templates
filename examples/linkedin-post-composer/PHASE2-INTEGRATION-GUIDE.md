# LinkedIn Post Composer - Phase 2 API Integration Guide

**Status:** Phase 1 Complete - Ready for API Integration
**Version:** 1.0.0
**Date:** 2025-11-02
**Prerequisites:** Phase 1 fully functional with mock data

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Integration 1: LinkedIn OAuth](#integration-1-linkedin-oauth)
4. [Integration 2: DALL-E Image Generation](#integration-2-dall-e-image-generation)
5. [Integration 3: Cloudflare R2 Storage](#integration-3-cloudflare-r2-storage)
6. [Integration 4: LinkedIn Publishing API](#integration-4-linkedin-publishing-api)
7. [Testing Phase 2](#testing-phase-2)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 2 replaces all mock data and stub implementations with real API integrations. This guide walks through each integration step-by-step.

### What We'll Replace

| Component | Phase 1 (Mock) | Phase 2 (Real) |
|-----------|----------------|----------------|
| Account Data | Mock accounts (personal + 2 orgs) | Real LinkedIn accounts via OAuth |
| Image Generation | Placeholder images | DALL-E 3 API |
| Image Upload | Data URLs (preview only) | Cloudflare R2 bucket storage |
| Post Publishing | Mock success message | LinkedIn Posts API |

### Integration Order

We'll integrate in this order to minimize dependencies:

1. **LinkedIn OAuth** - Get real user accounts first
2. **DALL-E API** - Generate real images
3. **Cloudflare R2** - Store uploaded and generated images
4. **LinkedIn Publishing** - Publish real posts (requires OAuth + R2)

---

## Prerequisites

### Accounts and API Keys Needed

- [ ] **LinkedIn Developer Account** (free)
  - Go to: https://www.linkedin.com/developers/
  - Create app to get Client ID and Secret

- [ ] **OpenAI Account** (paid - DALL-E 3 access)
  - Go to: https://platform.openai.com/
  - Generate API key
  - Note: DALL-E 3 costs ~$0.04-0.08 per image

- [ ] **Cloudflare Account** (free tier sufficient)
  - Already have Workers and Pages deployed
  - Will add R2 bucket

### Development Environment

```bash
# Ensure you're in the project directory
cd /Users/claudejones/Documents/app-sdk-projects/chatgpt-widget-templates/examples/linkedin-post-composer

# Verify Phase 1 deployments are working
cd mcp-server
npx wrangler tail  # Should show live logs

cd ../widget-react
npm run dev  # Should open local dev server
```

---

## Integration 1: LinkedIn OAuth

### Step 1.1: Create LinkedIn App

1. **Go to LinkedIn Developers**
   - URL: https://www.linkedin.com/developers/apps
   - Click "Create app"

2. **Fill in App Details**
   ```
   App name: LinkedIn Post Composer (ChatGPT Widget)
   LinkedIn Page: [Your company page or personal]
   App logo: [Upload a logo - optional]
   Privacy policy URL: [Your privacy policy]
   ```

3. **Get Credentials**
   - Navigate to "Auth" tab
   - Copy **Client ID** and **Client Secret**
   - Save these - we'll add to Cloudflare secrets

4. **Configure OAuth 2.0 Settings**
   - Click "Auth" tab
   - Under "OAuth 2.0 settings":

   **Redirect URLs** (add both):
   ```
   https://linkedin-post-composer-mcp.{your-account}.workers.dev/oauth/callback
   http://localhost:8787/oauth/callback
   ```

5. **Request API Access**
   - Click "Products" tab
   - Request access to:
     - **Sign In with LinkedIn using OpenID Connect** (approved instantly)
     - **Share on LinkedIn** (requires verification - may take 1-2 weeks)
     - **Advertising API** (optional for organizations)

   **Important:** You need "Share on LinkedIn" product access to publish posts. This requires LinkedIn to verify your app usage.

6. **Configure Scopes**
   - Once "Share on LinkedIn" is approved, go to "Auth" tab
   - Ensure these scopes are enabled:
     ```
     openid
     profile
     w_member_social  (publish to personal profile)
     ```

### Step 1.2: Add LinkedIn Credentials to Cloudflare

**IMPORTANT:** You must be in the `mcp-server` directory for wrangler commands to work.

```bash
# Navigate to mcp-server directory
cd examples/linkedin-post-composer/mcp-server

# Add LinkedIn Client ID
npx wrangler secret put LINKEDIN_CLIENT_ID
# When prompted, paste: 86d4bjtmqjxh2d (your Client ID)
# Press Enter

# Add LinkedIn Client Secret
npx wrangler secret put LINKEDIN_CLIENT_SECRET
# When prompted:
# 1. Go to LinkedIn Auth page
# 2. Click eye icon to reveal secret
# 3. Copy and paste here (won't show - this is normal for security)
# 4. Press Enter

# Verify both secrets are set
npx wrangler secret list
```

**Expected output:**
```json
[
  {
    "name": "LINKEDIN_CLIENT_ID",
    "type": "secret_text"
  },
  {
    "name": "LINKEDIN_CLIENT_SECRET",
    "type": "secret_text"
  }
]
```

**💡 Future Enhancement Note:**
This secret management process could be automated in a multi-tenant SaaS version where users configure their own LinkedIn apps through a UI, storing credentials per-tenant in KV storage.

### Step 1.3: Create KV Namespace for OAuth Tokens

```bash
# Create KV namespace for storing OAuth tokens
npx wrangler kv:namespace create "OAUTH_TOKENS"

# Output will look like:
# { binding = "OAUTH_TOKENS", id = "abc123..." }

# Copy the ID and add to wrangler.toml
```

**Update `mcp-server/wrangler.toml`:**

```toml
# Add this section
[[kv_namespaces]]
binding = "OAUTH_TOKENS"
id = "abc123..."  # Replace with your actual ID from above
```

### Step 1.4: Implement OAuth Flow in MCP Server

**Create `mcp-server/src/oauth/linkedin.ts`:**

```typescript
import { Env } from '../types';

interface LinkedInProfile {
  sub: string;  // User ID
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;  // seconds
  refresh_token?: string;
  scope: string;
}

export class LinkedInOAuth {
  constructor(private env: Env) {}

  /**
   * Step 1: Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.env.LINKEDIN_CLIENT_ID,
      redirect_uri: `${this.getBaseUrl()}/oauth/callback`,
      state: state,
      scope: 'openid profile w_member_social',
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  /**
   * Step 2: Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: this.env.LINKEDIN_CLIENT_ID,
      client_secret: this.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: `${this.getBaseUrl()}/oauth/callback`,
    });

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return await response.json();
  }

  /**
   * Step 3: Get user profile with access token
   */
  async getUserProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn profile fetch failed: ${error}`);
    }

    return await response.json();
  }

  /**
   * Step 4: Store access token in KV
   */
  async storeToken(userId: string, tokenData: LinkedInTokenResponse): Promise<void> {
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);

    const storedData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      scope: tokenData.scope,
    };

    await this.env.OAUTH_TOKENS.put(
      `linkedin:${userId}`,
      JSON.stringify(storedData),
      { expirationTtl: tokenData.expires_in }
    );
  }

  /**
   * Step 5: Retrieve access token from KV
   */
  async getToken(userId: string): Promise<string | null> {
    const data = await this.env.OAUTH_TOKENS.get(`linkedin:${userId}`, 'json');

    if (!data) {
      return null;
    }

    // Check if token is expired
    if (data.expires_at && Date.now() >= data.expires_at) {
      // TODO: Implement token refresh
      return null;
    }

    return data.access_token;
  }

  private getBaseUrl(): string {
    // In production, this will be your worker URL
    return `https://linkedin-post-composer-mcp.{your-account}.workers.dev`;
  }
}
```

### Step 1.5: Add OAuth Endpoints to MCP Server

**Update `mcp-server/src/index.ts`** to add OAuth routes:

```typescript
import { LinkedInOAuth } from './oauth/linkedin';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // OAuth initiation endpoint
    if (url.pathname === '/oauth/linkedin') {
      const state = crypto.randomUUID();
      const oauth = new LinkedInOAuth(env);
      const authUrl = oauth.getAuthorizationUrl(state);

      return Response.redirect(authUrl, 302);
    }

    // OAuth callback endpoint
    if (url.pathname === '/oauth/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response(`OAuth error: ${error}`, { status: 400 });
      }

      if (!code) {
        return new Response('Missing authorization code', { status: 400 });
      }

      try {
        const oauth = new LinkedInOAuth(env);

        // Exchange code for token
        const tokenData = await oauth.exchangeCodeForToken(code);

        // Get user profile
        const profile = await oauth.getUserProfile(tokenData.access_token);

        // Store token
        await oauth.storeToken(profile.sub, tokenData);

        // Return success page
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head><title>LinkedIn Connected</title></head>
            <body>
              <h1>✅ LinkedIn Connected Successfully!</h1>
              <p>User: ${profile.name}</p>
              <p>Email: ${profile.email}</p>
              <p>You can close this window and return to ChatGPT.</p>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (err) {
        console.error('OAuth callback error:', err);
        return new Response(`OAuth failed: ${err.message}`, { status: 500 });
      }
    }

    // ... rest of your existing MCP server code
  }
};
```

### Step 1.6: Update compose_linkedin_post Tool to Use Real Accounts

**Update `mcp-server/src/tools/compose_linkedin_post.ts`:**

```typescript
import { LinkedInOAuth } from '../oauth/linkedin';

export async function handleComposeLinkedInPost(
  args: ComposeLinkedInPostArgs,
  env: Env
): Promise<ComposeLinkedInPostOutput> {
  // For now, we'll use a hardcoded user ID
  // In production, you'd get this from ChatGPT user context
  const userId = 'current-user-id'; // TODO: Get from ChatGPT context

  const oauth = new LinkedInOAuth(env);
  const accessToken = await oauth.getToken(userId);

  if (!accessToken) {
    // User needs to authenticate
    return {
      content: args.content,
      postType: args.postType || 'text',
      accounts: {
        personal: {
          id: 'not-authenticated',
          name: 'Please Connect LinkedIn',
          profileUrl: `${env.WORKER_URL}/oauth/linkedin`,
        },
        organizations: [],
      },
      selectedAccountId: 'not-authenticated',
      phase1Features: {
        allowImageUpload: false,
        allowAiGeneration: false,
      },
      needsAuth: true,
      authUrl: `${env.WORKER_URL}/oauth/linkedin`,
    };
  }

  // Fetch real LinkedIn profile
  const profile = await oauth.getUserProfile(accessToken);

  // Fetch user's organizations (if they have access)
  const organizations = await fetchUserOrganizations(accessToken);

  return {
    content: args.content,
    postType: args.postType || 'text',
    accounts: {
      personal: {
        id: profile.sub,
        name: profile.name,
        profileUrl: `https://linkedin.com/in/${profile.sub}`, // Approximate
      },
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        pageUrl: org.vanityName ? `https://linkedin.com/company/${org.vanityName}` : '',
      })),
    },
    selectedAccountId: profile.sub,
    image: args.imageSource ? {
      source: args.imageSource,
      prompt: args.suggestedImagePrompt,
    } : undefined,
    phase1Features: {
      allowImageUpload: true,
      allowAiGeneration: true,
    },
  };
}

async function fetchUserOrganizations(accessToken: string): Promise<any[]> {
  // TODO: Implement organization fetching
  // LinkedIn API: GET https://api.linkedin.com/v2/organizationAcls?q=roleAssignee
  // Requires additional permissions
  return [];
}
```

### Step 1.7: Test OAuth Flow

```bash
# Deploy updated MCP server
cd mcp-server
npm run build
npx wrangler deploy

# Test OAuth flow
# 1. Open browser to: https://linkedin-post-composer-mcp.{your-account}.workers.dev/oauth/linkedin
# 2. Should redirect to LinkedIn login
# 3. After approval, should redirect back with success message

# Check that token was stored in KV
npx wrangler kv:key list --namespace-id={your-namespace-id}
```

**Expected Output:**
- Browser redirects to LinkedIn
- You authorize the app
- Browser shows "LinkedIn Connected Successfully"
- Token is stored in KV namespace

---

## Integration 2: DALL-E Image Generation

### Step 2.1: Get OpenAI API Key

1. **Sign up for OpenAI**
   - Go to: https://platform.openai.com/
   - Create account or sign in

2. **Add Payment Method**
   - Go to: https://platform.openai.com/account/billing
   - Add credit card
   - DALL-E 3 costs: $0.040/image (1024×1024), $0.080/image (1024×1792 or 1792×1024)

3. **Generate API Key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it: "LinkedIn Post Composer"
   - **Copy the key - you'll only see it once!**

### Step 2.2: Add OpenAI Key to Cloudflare

```bash
cd mcp-server

# Add OpenAI API key as Cloudflare secret
npx wrangler secret put OPENAI_API_KEY
# When prompted, paste your API key (starts with sk-...)

# Verify
npx wrangler secret list
```

### Step 2.3: Implement DALL-E Integration

**Create `mcp-server/src/integrations/dalle.ts`:**

```typescript
import { Env } from '../types';

export interface GenerateImageArgs {
  prompt: string;
  style?: 'natural' | 'vivid';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
}

export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  revisedPrompt?: string;
  error?: string;
}

export class DalleImageGenerator {
  constructor(private env: Env) {}

  async generateImage(args: GenerateImageArgs): Promise<GenerateImageResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: args.prompt,
          n: 1,  // DALL-E 3 only supports n=1
          size: args.size || '1024x1024',
          quality: 'standard',  // or 'hd' for 2x cost
          style: args.style || 'natural',  // 'natural' or 'vivid'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('DALL-E API error:', error);

        return {
          success: false,
          error: error.error?.message || 'Image generation failed',
        };
      }

      const data = await response.json();
      const imageData = data.data[0];

      return {
        success: true,
        imageUrl: imageData.url,  // URL expires in 1 hour - we'll upload to R2
        revisedPrompt: imageData.revised_prompt,  // DALL-E may revise your prompt
      };
    } catch (err) {
      console.error('DALL-E generation error:', err);
      return {
        success: false,
        error: err.message || 'Unexpected error during image generation',
      };
    }
  }

  /**
   * Download generated image from OpenAI's temporary URL
   * (URL expires in 1 hour, so we need to download immediately)
   */
  async downloadImage(imageUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error('Failed to download generated image');
    }

    return await response.arrayBuffer();
  }
}
```

### Step 2.4: Update generate_image Tool

**Update `mcp-server/src/tools/generate_image.ts`:**

```typescript
import { DalleImageGenerator } from '../integrations/dalle';

export async function handleGenerateImage(
  args: { prompt: string; style?: string; size?: string },
  env: Env
): Promise<GenerateImageOutput> {
  const generator = new DalleImageGenerator(env);

  // Generate image with DALL-E
  const result = await generator.generateImage({
    prompt: args.prompt,
    style: args.style as 'natural' | 'vivid',
    size: args.size as '1024x1024' | '1792x1024' | '1024x1792',
  });

  if (!result.success) {
    return {
      success: false,
      message: `Image generation failed: ${result.error}`,
      error: result.error,
    };
  }

  // Download the image (URL expires in 1 hour)
  const imageBuffer = await generator.downloadImage(result.imageUrl!);

  // TODO: Upload to R2 (see Integration 3)
  // For now, return the temporary URL
  return {
    success: true,
    message: 'Image generated successfully!',
    imageUrl: result.imageUrl!,
    revisedPrompt: result.revisedPrompt,
  };
}
```

### Step 2.5: Test DALL-E Integration

```bash
# Deploy updated server
cd mcp-server
npm run build
npx wrangler deploy

# Test with curl
curl -X POST https://linkedin-post-composer-mcp.{your-account}.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "generate_image",
      "arguments": {
        "prompt": "A professional business meeting in a modern office, natural lighting, photorealistic"
      }
    }
  }'
```

**Expected Output:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "structuredContent": {
      "success": true,
      "message": "Image generated successfully!",
      "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revisedPrompt": "A professional business meeting..."
    }
  }
}
```

---

## Integration 3: Cloudflare R2 Storage

### Step 3.1: Create R2 Bucket

```bash
cd mcp-server

# Create R2 bucket for image storage
npx wrangler r2 bucket create linkedin-post-composer-images

# Output: Created bucket linkedin-post-composer-images
```

### Step 3.2: Configure R2 in wrangler.toml

**Update `mcp-server/wrangler.toml`:**

```toml
# Add R2 bucket binding
[[r2_buckets]]
binding = "IMAGES_BUCKET"
bucket_name = "linkedin-post-composer-images"
```

### Step 3.3: Enable Public Access for R2 Bucket

```bash
# Option 1: Use R2.dev subdomain (free, simple)
npx wrangler r2 bucket domain add linkedin-post-composer-images --jurisdiction=us

# Option 2: Use custom domain (requires Cloudflare DNS)
# Configure in Cloudflare dashboard: R2 > linkedin-post-composer-images > Settings > Public URL
```

**Get your R2 public URL:**
- Format: `https://pub-{hash}.r2.dev` (R2.dev subdomain)
- Or: `https://images.yourdomain.com` (custom domain)

Add to your environment:

```bash
# Add R2 public URL to .dev.vars for local testing
echo 'R2_PUBLIC_URL="https://pub-{hash}.r2.dev"' >> mcp-server/.dev.vars

# For production, add as environment variable in wrangler.toml
```

**Update `mcp-server/wrangler.toml`:**

```toml
[vars]
R2_PUBLIC_URL = "https://pub-{hash}.r2.dev"  # Replace with your actual URL
```

### Step 3.4: Implement R2 Upload Functions

**Create `mcp-server/src/storage/r2-upload.ts`:**

```typescript
import { Env } from '../types';

export class R2ImageStorage {
  constructor(private env: Env) {}

  /**
   * Upload image buffer to R2
   */
  async uploadImage(
    imageBuffer: ArrayBuffer,
    filename: string,
    contentType: string = 'image/png'
  ): Promise<string> {
    // Generate unique key with timestamp
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split('-')[0];
    const extension = this.getExtensionFromContentType(contentType);
    const key = `linkedin-posts/${timestamp}-${randomId}${extension}`;

    // Upload to R2
    await this.env.IMAGES_BUCKET.put(key, imageBuffer, {
      httpMetadata: {
        contentType: contentType,
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalFilename: filename,
      },
    });

    // Return public URL
    return `${this.env.R2_PUBLIC_URL}/${key}`;
  }

  /**
   * Upload from URL (for DALL-E generated images)
   */
  async uploadFromUrl(imageUrl: string, filename?: string): Promise<string> {
    // Download image
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    const name = filename || `generated-${Date.now()}.png`;

    return await this.uploadImage(imageBuffer, name, contentType);
  }

  /**
   * Upload from base64 (for user uploads from widget)
   */
  async uploadFromBase64(base64Data: string, filename: string): Promise<string> {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Decode base64
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Detect content type from filename
    const contentType = this.getContentTypeFromFilename(filename);

    return await this.uploadImage(bytes.buffer, filename, contentType);
  }

  /**
   * Delete image from R2
   */
  async deleteImage(imageUrl: string): Promise<void> {
    // Extract key from URL
    const key = imageUrl.replace(`${this.env.R2_PUBLIC_URL}/`, '');
    await this.env.IMAGES_BUCKET.delete(key);
  }

  private getExtensionFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };
    return map[contentType] || '.png';
  }

  private getContentTypeFromFilename(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    return map[extension || ''] || 'image/png';
  }
}
```

### Step 3.5: Update generate_image to Use R2

**Update `mcp-server/src/tools/generate_image.ts`:**

```typescript
import { DalleImageGenerator } from '../integrations/dalle';
import { R2ImageStorage } from '../storage/r2-upload';

export async function handleGenerateImage(
  args: { prompt: string; style?: string; size?: string },
  env: Env
): Promise<GenerateImageOutput> {
  const generator = new DalleImageGenerator(env);
  const storage = new R2ImageStorage(env);

  // Generate image with DALL-E
  const result = await generator.generateImage({
    prompt: args.prompt,
    style: args.style as 'natural' | 'vivid',
    size: args.size as '1024x1024' | '1792x1024' | '1024x1792',
  });

  if (!result.success) {
    return {
      success: false,
      message: `Image generation failed: ${result.error}`,
      error: result.error,
    };
  }

  try {
    // Upload to R2 (DALL-E URLs expire in 1 hour)
    const permanentUrl = await storage.uploadFromUrl(
      result.imageUrl!,
      `dall-e-${Date.now()}.png`
    );

    return {
      success: true,
      message: 'Image generated and saved successfully!',
      imageUrl: permanentUrl,  // Now a permanent R2 URL
      imageKey: permanentUrl.split('/').pop(),
    };
  } catch (uploadError) {
    console.error('R2 upload failed:', uploadError);
    return {
      success: false,
      message: `Image generated but upload failed: ${uploadError.message}`,
      error: uploadError.message,
    };
  }
}
```

### Step 3.6: Update upload_image to Use R2

**Update `mcp-server/src/tools/upload_image.ts`:**

```typescript
import { R2ImageStorage } from '../storage/r2-upload';

export async function handleUploadImage(
  args: { image: string; filename: string },
  env: Env
): Promise<UploadImageOutput> {
  const storage = new R2ImageStorage(env);

  // Validate file size (max 10MB for base64)
  const sizeInBytes = (args.image.length * 3) / 4;  // Approximate base64 size
  const maxSizeInBytes = 10 * 1024 * 1024;  // 10MB

  if (sizeInBytes > maxSizeInBytes) {
    return {
      success: false,
      message: 'Image too large. Maximum size is 10MB.',
      error: 'FILE_TOO_LARGE',
    };
  }

  // Validate file type
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = args.filename.split('.').pop()?.toLowerCase();

  if (!extension || !validExtensions.includes(extension)) {
    return {
      success: false,
      message: 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp',
      error: 'INVALID_FILE_TYPE',
    };
  }

  try {
    // Upload to R2
    const imageUrl = await storage.uploadFromBase64(args.image, args.filename);

    return {
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl: imageUrl,
      imageKey: imageUrl.split('/').pop(),
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    return {
      success: false,
      message: `Upload failed: ${error.message}`,
      error: error.message,
    };
  }
}
```

### Step 3.7: Test R2 Upload

```bash
# Deploy with R2 binding
cd mcp-server
npm run build
npx wrangler deploy

# Test image upload
curl -X POST https://linkedin-post-composer-mcp.{your-account}.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "upload_image",
      "arguments": {
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "filename": "test.png"
      }
    }
  }'

# Verify image is accessible
# Copy imageUrl from response and open in browser
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Image uploaded successfully!",
  "imageUrl": "https://pub-{hash}.r2.dev/linkedin-posts/1699123456789-abc123.png",
  "imageKey": "1699123456789-abc123.png"
}
```

---

## Integration 4: LinkedIn Publishing API

### Step 4.1: Implement LinkedIn Posts API Client

**Create `mcp-server/src/integrations/linkedin-api.ts`:**

```typescript
import { Env } from '../types';

export interface PublishPostArgs {
  accessToken: string;
  authorId: string;  // User ID (urn:li:person:XXX) or Org ID (urn:li:organization:XXX)
  content: string;
  imageUrl?: string;
}

export interface PublishPostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  message: string;
  error?: string;
}

export class LinkedInAPI {
  private baseUrl = 'https://api.linkedin.com/rest';

  constructor(private env: Env) {}

  /**
   * Publish a text or image post to LinkedIn
   */
  async publishPost(args: PublishPostArgs): Promise<PublishPostResult> {
    try {
      let mediaAssetUrn: string | undefined;

      // If image is included, upload it first
      if (args.imageUrl) {
        mediaAssetUrn = await this.uploadImage(args.accessToken, args.authorId, args.imageUrl);
      }

      // Create the post
      const postPayload = {
        author: args.authorId,
        commentary: args.content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      };

      // Add media if present
      if (mediaAssetUrn) {
        postPayload['content'] = {
          media: {
            title: 'Post Image',
            id: mediaAssetUrn,
          },
        };
      }

      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${args.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202405',
        },
        body: JSON.stringify(postPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn post creation failed:', error);

        return {
          success: false,
          message: 'Failed to publish post',
          error: error,
        };
      }

      const result = await response.json();
      const postId = result.id;  // Response contains post ID

      // Construct post URL (approximate - actual URL may vary)
      const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

      return {
        success: true,
        postId: postId,
        postUrl: postUrl,
        message: 'Post published successfully to LinkedIn!',
      };
    } catch (err) {
      console.error('LinkedIn publish error:', err);
      return {
        success: false,
        message: 'Unexpected error during publishing',
        error: err.message,
      };
    }
  }

  /**
   * Upload image to LinkedIn and get media asset URN
   */
  private async uploadImage(
    accessToken: string,
    authorId: string,
    imageUrl: string
  ): Promise<string> {
    // Step 1: Register upload
    const registerResponse = await fetch(`${this.baseUrl}/images?action=initializeUpload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202405',
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: authorId,
        },
      }),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      throw new Error(`Image upload registration failed: ${error}`);
    }

    const registerData = await registerResponse.json();
    const uploadUrl = registerData.value.uploadUrl;
    const imageUrn = registerData.value.image;

    // Step 2: Download image from R2
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Step 3: Upload image to LinkedIn's upload URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Image upload failed: ${error}`);
    }

    return imageUrn;
  }
}
```

### Step 4.2: Update publish_post Tool

**Update `mcp-server/src/tools/publish_post.ts`:**

```typescript
import { LinkedInAPI } from '../integrations/linkedin-api';
import { LinkedInOAuth } from '../oauth/linkedin';

export async function handlePublishPost(
  args: {
    accountId: string;
    content: string;
    imageUrl?: string;
    postType: string;
  },
  env: Env
): Promise<PublishPostOutput> {
  // Get user's access token
  const oauth = new LinkedInOAuth(env);
  const userId = extractUserIdFromAccount(args.accountId);
  const accessToken = await oauth.getToken(userId);

  if (!accessToken) {
    return {
      success: false,
      message: 'Not authenticated. Please connect your LinkedIn account.',
      error: 'NO_ACCESS_TOKEN',
    };
  }

  // Validate content
  if (!args.content || args.content.trim().length === 0) {
    return {
      success: false,
      message: 'Post content cannot be empty',
      error: 'EMPTY_CONTENT',
    };
  }

  if (args.content.length > 3000) {
    return {
      success: false,
      message: 'Post content exceeds 3000 character limit',
      error: 'CONTENT_TOO_LONG',
    };
  }

  // Publish to LinkedIn
  const api = new LinkedInAPI(env);
  const result = await api.publishPost({
    accessToken: accessToken,
    authorId: args.accountId,
    content: args.content,
    imageUrl: args.imageUrl,
  });

  return {
    success: result.success,
    postId: result.postId,
    postUrl: result.postUrl,
    message: result.message,
    error: result.error,
  };
}

function extractUserIdFromAccount(accountId: string): string {
  // accountId format: urn:li:person:ABC123 or urn:li:organization:XYZ789
  // Extract the ID part after the last colon
  return accountId.split(':').pop() || accountId;
}
```

### Step 4.3: Test Publishing

```bash
# Deploy complete integration
cd mcp-server
npm run build
npx wrangler deploy

# Test complete flow:
# 1. Authenticate with LinkedIn (if not already)
# 2. Open widget in ChatGPT
# 3. Create a post
# 4. Click "Publish to LinkedIn"
# 5. Verify post appears on your LinkedIn feed
```

**Test with ChatGPT:**

```
User: Create a LinkedIn post about completing Phase 2 integration

ChatGPT will:
1. Call compose_linkedin_post tool
2. Widget opens with your real LinkedIn account
3. You can edit content, add image
4. Click "Publish to LinkedIn"
5. Real post is published!
```

---

## Integration 5: Update Widget UI for Real APIs

### Step 5.1: Add OAuth Connection UI

**Update `widget-react/src/App.tsx`** to show OAuth connection prompt:

```typescript
// At the top of App component
const toolData = useToolData<ComposeLinkedInPostOutput>();

// Add OAuth check
if (toolData?.needsAuth) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Connect LinkedIn</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          To publish posts, please connect your LinkedIn account.
        </p>
        <a
          href={toolData.authUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-blue-600 text-white rounded-lg px-4 py-3 text-center font-semibold hover:bg-blue-700"
        >
          Connect LinkedIn Account
        </a>
        <p className="text-sm text-gray-500 mt-4">
          You'll be redirected to LinkedIn to authorize this app.
        </p>
      </div>
    </div>
  );
}
```

### Step 5.2: Update Image Generation Loading States

**Update `widget-react/src/components/ImageSection.tsx`:**

```typescript
// Show more detailed loading message for DALL-E
{generateImage.loading && (
  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Generating image with DALL-E 3... (this may take 10-30 seconds)</span>
  </div>
)}
```

### Step 5.3: Deploy Updated Widget

```bash
cd widget-react

# Build widget
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=linkedin-post-composer --commit-dirty=true
```

---

## Testing Phase 2

### End-to-End Test Checklist

- [ ] **OAuth Flow**
  - [ ] Can initiate OAuth from widget
  - [ ] LinkedIn authorization works
  - [ ] Token is stored in KV
  - [ ] Real account name appears in widget

- [ ] **DALL-E Image Generation**
  - [ ] Can generate image with custom prompt
  - [ ] Image appears in widget (from R2 URL)
  - [ ] Generation takes 10-30 seconds
  - [ ] Error handling works (bad prompt, rate limit)

- [ ] **Image Upload**
  - [ ] Can upload JPG/PNG files
  - [ ] File size validation works (max 10MB)
  - [ ] Uploaded image appears in widget
  - [ ] Image is accessible via R2 public URL

- [ ] **Post Publishing**
  - [ ] Text-only post publishes successfully
  - [ ] Post with uploaded image publishes
  - [ ] Post with generated image publishes
  - [ ] Success message shows real LinkedIn post URL
  - [ ] Post appears on LinkedIn feed

- [ ] **Error Handling**
  - [ ] Shows error if not authenticated
  - [ ] Shows error if image generation fails
  - [ ] Shows error if upload fails
  - [ ] Shows error if publish fails
  - [ ] Error messages are user-friendly

### Performance Benchmarks

Expected latency for each operation:

| Operation | Expected Time |
|-----------|--------------|
| OAuth redirect | < 1 second |
| Load real accounts | < 2 seconds |
| Generate image (DALL-E) | 10-30 seconds |
| Upload image to R2 | < 3 seconds |
| Publish post | 2-5 seconds |
| Publish post with image | 5-10 seconds |

---

## Deployment

### Final Deployment Steps

```bash
# 1. Deploy MCP server with all integrations
cd mcp-server
npm run build
npx wrangler deploy

# 2. Deploy widget
cd ../widget-react
npm run build
npx wrangler pages deploy dist --project-name=linkedin-post-composer

# 3. Verify deployments
echo "MCP Server: https://linkedin-post-composer-mcp.{your-account}.workers.dev/health"
echo "Widget: https://linkedin-post-composer.pages.dev"

# 4. Test health endpoint
curl https://linkedin-post-composer-mcp.{your-account}.workers.dev/health
```

### Environment Variables Checklist

Ensure all secrets are set:

```bash
cd mcp-server

# Check all secrets are configured
npx wrangler secret list

# Should show:
# - LINKEDIN_CLIENT_ID
# - LINKEDIN_CLIENT_SECRET
# - OPENAI_API_KEY
```

### Update README

**Create/Update `examples/linkedin-post-composer/README.md`:**

```markdown
# LinkedIn Post Composer - Phase 2 (Real APIs)

**Status:** ✅ Production Ready with Real API Integration

## Features

- ✅ LinkedIn OAuth authentication
- ✅ Real account data from LinkedIn API
- ✅ DALL-E 3 image generation
- ✅ Cloudflare R2 image storage
- ✅ LinkedIn Posts API publishing

## Deployments

- **MCP Server:** https://linkedin-post-composer-mcp.{your-account}.workers.dev
- **Widget:** https://linkedin-post-composer.pages.dev

## Setup

1. **LinkedIn App:** Create app at https://linkedin.com/developers
2. **OpenAI API:** Get key at https://platform.openai.com
3. **Configure Secrets:** See PHASE2-INTEGRATION-GUIDE.md

## Usage in ChatGPT

1. Say: "Create a LinkedIn post about [topic]"
2. ChatGPT opens widget with your content
3. Connect LinkedIn (first time only)
4. Edit content, add image (generate with AI or upload)
5. Click "Publish to LinkedIn"
6. Post goes live on your LinkedIn feed!

## Costs

- **LinkedIn API:** Free (100 posts/day limit)
- **DALL-E 3:** $0.04 per 1024x1024 image
- **Cloudflare R2:** $0.015/GB storage (free tier: 10GB)

## Docs

- [PRD](PRD.md)
- [Implementation Notes](IMPLEMENTATION.md)
- [Phase 2 Integration Guide](PHASE2-INTEGRATION-GUIDE.md)
```

---

## Troubleshooting

### LinkedIn OAuth Issues

**Problem:** "Invalid redirect_uri"

**Solution:**
- Verify redirect URI in LinkedIn app settings exactly matches your worker URL
- Include both production and localhost URLs for testing
- Format: `https://linkedin-post-composer-mcp.{account}.workers.dev/oauth/callback`

**Problem:** "Access token expired"

**Solution:**
- Tokens expire after 60 days
- Implement token refresh (see LinkedIn OAuth docs)
- For now, user can re-authenticate

### DALL-E API Issues

**Problem:** "Rate limit exceeded"

**Solution:**
- OpenAI has rate limits per account tier
- Implement exponential backoff retry
- Show user-friendly error message
- Consider caching generated images

**Problem:** "Content policy violation"

**Solution:**
- DALL-E rejects certain prompts (violence, adult content, etc.)
- Show specific error message to user
- Suggest prompt revision

### R2 Upload Issues

**Problem:** "Image not accessible after upload"

**Solution:**
- Verify R2 bucket has public access enabled
- Check R2_PUBLIC_URL is correct in wrangler.toml
- Test URL directly in browser

**Problem:** "Upload fails with 413 (Too Large)"

**Solution:**
- Cloudflare Workers have 100MB request limit
- Implement client-side image compression before upload
- Or use direct R2 uploads from client with presigned URLs

### LinkedIn Publishing Issues

**Problem:** "403 Forbidden when publishing"

**Solution:**
- Verify "Share on LinkedIn" product is approved (not just requested)
- Check access token has `w_member_social` scope
- Ensure author URN format is correct: `urn:li:person:ABC123`

**Problem:** "Image upload fails during publish"

**Solution:**
- LinkedIn requires image to be uploaded before creating post
- Verify image URL is publicly accessible
- Check image size meets LinkedIn requirements (max 5MB for images)

### Common Errors

| Error Code | Meaning | Fix |
|------------|---------|-----|
| `NO_ACCESS_TOKEN` | User not authenticated | Redirect to OAuth flow |
| `INVALID_GRANT` | OAuth code expired | Retry OAuth from beginning |
| `CONTENT_TOO_LONG` | Post exceeds 3000 chars | Show character count, prevent submit |
| `FILE_TOO_LARGE` | Image exceeds 10MB | Compress image or show error |
| `RATE_LIMIT_EXCEEDED` | Too many API calls | Implement exponential backoff |

---

## Next Steps After Phase 2

Once Phase 2 is working smoothly, consider:

1. **Phase 3: Advanced Features**
   - Carousel posts (2-10 images)
   - Video posts
   - Post scheduling
   - Hashtag suggestions
   - Analytics tracking

2. **Optimizations**
   - Image compression before upload
   - DALL-E prompt optimization
   - Token refresh implementation
   - Error recovery improvements

3. **Monitoring**
   - Set up Cloudflare Workers analytics
   - Track API usage and costs
   - Monitor error rates
   - User feedback collection

4. **Documentation**
   - Create user guide
   - Record demo video
   - Write blog post about implementation
   - Share on GitHub

---

## Resources

- **LinkedIn API Docs:** https://learn.microsoft.com/en-us/linkedin/
- **DALL-E API Docs:** https://platform.openai.com/docs/guides/images
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **MCP Specification:** https://spec.modelcontextprotocol.io/

---

**Congratulations! 🎉**

You've successfully integrated all Phase 2 real APIs. Your LinkedIn Post Composer is now a fully functional production widget!
