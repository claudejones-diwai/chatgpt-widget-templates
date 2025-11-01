import type { ComposeLinkedInPostOutput } from '../../../shared-types';
import { getLinkedInAccounts } from '../integrations/linkedin-api';

export interface ComposePostParams {
  content: string;
  postType?: 'text' | 'image' | 'carousel' | 'video' | 'document' | 'poll';
  imageSource?: 'upload' | 'ai-generate' | 'url';
  imageUrl?: string;
  suggestedImagePrompt?: string;
  accountType?: 'personal' | 'organization';
}

export async function handleComposePost(params: ComposePostParams): Promise<ComposeLinkedInPostOutput> {
  const {
    content,
    postType = 'text',
    imageSource,
    imageUrl,
    suggestedImagePrompt,
    accountType = 'personal'
  } = params;

  // Fetch accounts (stub data in Phase 1)
  const accounts = await getLinkedInAccounts();

  // Build output structure
  const output: ComposeLinkedInPostOutput = {
    content,
    postType,
    accounts,
    selectedAccountId: accounts.personal.id, // Default to personal
    phase1Features: {
      allowImageUpload: true,
      allowAiGeneration: true
    }
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
