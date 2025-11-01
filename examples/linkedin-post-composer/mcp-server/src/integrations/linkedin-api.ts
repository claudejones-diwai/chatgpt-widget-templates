/**
 * LinkedIn API Integration
 *
 * ⚠️ PHASE 1: All functions return STUB data
 * ⚠️ PHASE 2: Replace with real LinkedIn API calls
 *
 * Documentation:
 * - Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
 * - Images API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api
 * - OAuth Setup: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
 * - Required Scopes: w_member_social (personal), w_organization_social (company)
 */

import type { PublishPostOutput, GenerateImageOutput, UploadImageOutput } from '../../../shared-types';

export interface LinkedInPost {
  accountId: string;
  content: string;
  imageUrl?: string;
  postType: 'text' | 'image';
}

/**
 * PHASE 1 STUB: Publish post to LinkedIn
 *
 * Phase 2 implementation:
 * 1. Validate OAuth token
 * 2. Upload image to LinkedIn Images API (if imageUrl provided)
 * 3. Create post using Posts API
 * 4. Return real post URN and URL
 */
export async function publishToLinkedIn(post: LinkedInPost): Promise<PublishPostOutput> {
  console.log('STUB: Would publish to LinkedIn:', post);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    postId: `urn:li:share:MOCK_${Date.now()}`,
    postUrl: `https://linkedin.com/feed/update/urn:li:share:MOCK_${Date.now()}`,
    message: `✅ Post published successfully!\n\n⚠️ Using mock data. To integrate real LinkedIn API:\n1. Set up LinkedIn OAuth (w_member_social scope)\n2. Replace stub in mcp-server/src/integrations/linkedin-api.ts\n3. See PRD.md for API documentation links`
  };
}

/**
 * PHASE 1 STUB: Generate image using DALL-E
 *
 * Phase 2 implementation:
 * 1. Validate OPENAI_API_KEY environment variable
 * 2. Call OpenAI DALL-E API: POST https://api.openai.com/v1/images/generations
 * 3. Download generated image
 * 4. Upload to Cloudflare R2 storage
 * 5. Return public R2 URL
 */
export async function generateImage(
  prompt: string,
  style: 'professional' | 'creative' | 'minimalist' = 'professional',
  size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024'
): Promise<GenerateImageOutput> {
  console.log('STUB: Would generate image with DALL-E:', { prompt, style, size });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return a data URL SVG placeholder (no CORS issues)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="#0A66C2"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48" font-family="Arial, sans-serif" font-weight="bold">
      AI Generated Image
    </text>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" opacity="0.8">
      Phase 1 Placeholder
    </text>
    <text x="50%" y="63%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-family="Arial, sans-serif" opacity="0.6">
      ${prompt.substring(0, 80)}${prompt.length > 80 ? '...' : ''}
    </text>
  </svg>`;

  const imageUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

  return {
    success: true,
    imageUrl,
    imageKey: `linkedin-posts/${Date.now()}-generated.png`
  };
}

/**
 * PHASE 1 STUB: Upload image to Cloudflare R2
 *
 * Phase 2 implementation:
 * 1. Validate file type and size
 * 2. Generate unique filename
 * 3. Upload to Cloudflare R2 bucket
 * 4. Return public R2 URL
 */
export async function uploadImage(
  imageData: string,  // base64 or file data
  filename: string
): Promise<UploadImageOutput> {
  console.log('STUB: Would upload image to R2:', { filename });

  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // For Phase 1, return the data URL directly (actual upload happens in Phase 2)
  return {
    success: true,
    imageUrl: imageData, // Return the data URL for immediate preview
    imageKey: `linkedin-posts/${Date.now()}-${filename}`
  };
}

/**
 * PHASE 1 STUB: Get user's LinkedIn accounts
 *
 * Phase 2 implementation:
 * 1. Validate OAuth token
 * 2. Fetch user profile: GET https://api.linkedin.com/v2/userinfo
 * 3. Fetch organization pages: GET https://api.linkedin.com/v2/organizationAcls
 * 4. Return real account data
 */
export async function getLinkedInAccounts() {
  console.log('STUB: Would fetch LinkedIn accounts');

  return {
    personal: {
      id: "urn:li:person:MOCK_123",
      name: "Claude Jones",
      profileUrl: "https://linkedin.com/in/claudejones"
    },
    organizations: [
      {
        id: "urn:li:organization:MOCK_456",
        name: "TechCorp AI",
        pageUrl: "https://linkedin.com/company/techcorp-ai"
      },
      {
        id: "urn:li:organization:MOCK_789",
        name: "Innovation Labs",
        pageUrl: "https://linkedin.com/company/innovation-labs"
      }
    ]
  };
}
