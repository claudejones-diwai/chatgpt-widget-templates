// Shared TypeScript types for LinkedIn Post Composer widget
// Used by both MCP server and React widget

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

  // Suggested image prompt from ChatGPT (for initial AI generation)
  suggestedImagePrompt?: string;

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

export interface GenerateImageOutput {
  success: boolean;
  imageUrl?: string;      // Public URL from Cloudflare R2 storage
  imageKey?: string;      // Storage key for future cleanup
  error?: string;
}

export interface UploadImageOutput {
  success: boolean;
  imageUrl?: string;      // Public URL from R2
  imageKey?: string;      // Storage key
  error?: string;
}

export interface PublishPostOutput {
  success: boolean;
  postId?: string;        // LinkedIn post URN
  postUrl?: string;       // Public URL to view published post
  message: string;        // Success/error message
  error?: string;
}
