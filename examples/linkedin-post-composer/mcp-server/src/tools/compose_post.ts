import type { ComposeLinkedInPostOutput } from '../../../shared-types';
import { LinkedInPostsAPI } from '../integrations/linkedin-posts-api';
import type { Env } from '../index';

export interface ComposePostParams {
  content: string;
  postType?: 'text' | 'image' | 'carousel' | 'video' | 'document' | 'poll';
  imageSource?: 'upload' | 'ai-generate' | 'url';
  imageUrl?: string;
  suggestedImagePrompt?: string;
  accountType?: 'personal' | 'organization';
}

export async function handleComposePost(params: ComposePostParams, env: Env): Promise<ComposeLinkedInPostOutput> {
  const {
    content,
    postType = 'text',
    imageSource,
    imageUrl,
    suggestedImagePrompt,
    accountType = 'personal'
  } = params;

  // Get authenticated user ID from KV storage
  // In single-tenant mode, we just get the first (and only) authenticated user
  const userId = await getAuthenticatedUserId(env);

  let accounts;

  if (userId) {
    // Fetch real LinkedIn accounts
    console.log('Fetching LinkedIn accounts for user:', userId);
    const linkedInAPI = new LinkedInPostsAPI(env);
    const realAccounts = await linkedInAPI.getAccounts(userId);

    if (realAccounts) {
      console.log('Successfully fetched accounts:', {
        personal: realAccounts.personal.name,
        organizationCount: realAccounts.organizations.length,
        organizations: realAccounts.organizations.map(o => o.name)
      });
      accounts = realAccounts;
    } else {
      console.log('Failed to fetch accounts, using mock data');
      // Fallback to mock data if fetch fails
      accounts = getMockAccounts();
    }
  } else {
    console.log('No authenticated user, using mock data');
    // No authenticated user, return mock data
    accounts = getMockAccounts();
  }

  // Build output structure
  const output: ComposeLinkedInPostOutput = {
    content,
    postType,
    accounts,
    selectedAccountId: accounts.personal.id, // Default to personal
    phase1Features: {
      allowImageUpload: true,
      allowAiGeneration: true
    },
    readOnlyHint: "Your LinkedIn post is ready in the composer above. Use the interface to select an account, add an image if desired, and click Publish. I've completed my part - the rest is in your hands!"
  };

  // Only create image object if we have an actual image URL
  // For ai-generate, pass suggestedImagePrompt separately so buttons show
  if (postType === 'image' && imageSource === 'url' && imageUrl) {
    output.image = {
      source: 'url',
      url: imageUrl
    };
  }

  // Pass suggested prompt separately (not as part of image object)
  if (suggestedImagePrompt) {
    output.suggestedImagePrompt = suggestedImagePrompt;
  }

  return output;
}

/**
 * Get the authenticated user ID from KV storage
 * In single-tenant mode, we just return the first user we find
 */
async function getAuthenticatedUserId(env: Env): Promise<string | null> {
  try {
    // List all keys in OAUTH_TOKENS namespace
    const keys = await env.OAUTH_TOKENS.list({ prefix: 'linkedin:' });

    if (keys.keys.length === 0) {
      return null;
    }

    // Extract user ID from the first key (format: linkedin:{userId})
    const firstKey = keys.keys[0].name;
    const userId = firstKey.replace('linkedin:', '');

    return userId;
  } catch (error) {
    console.error('Error getting authenticated user ID:', error);
    return null;
  }
}

/**
 * Mock accounts fallback (used when not authenticated or API fails)
 */
function getMockAccounts() {
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
