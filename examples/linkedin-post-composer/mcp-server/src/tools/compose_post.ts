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

  // Handle image if postType is 'image'
  if (postType === 'image' && imageSource) {
    output.image = {
      source: imageSource,
      url: imageSource === 'url' ? imageUrl : undefined,
      prompt: imageSource === 'ai-generate' ? suggestedImagePrompt : undefined
    };
  }

  return output;
}
