// Shared TypeScript types for LinkedIn Post Composer widget
// Used by both MCP server and React widget

export interface ComposeLinkedInPostOutput {
  // Content (editable in widget)
  content: string;
  postType: 'text' | 'image' | 'carousel' | 'video' | 'document' | 'poll';

  // ChatGPT instructions - what to tell the user after widget renders
  readOnlyHint?: string;

  // Account selection (stub data for Phase 1)
  accounts: {
    personal: {
      id: string;              // URN: urn:li:person:MOCK_123
      name: string;
      profileUrl: string;
      avatarUrl?: string;      // Profile picture URL
      headline?: string;       // e.g., "Product Manager at TechCorp"
    };
    organizations: {
      id: string;              // URN: urn:li:organization:MOCK_456
      name: string;
      pageUrl: string;
      logoUrl?: string;        // Organization logo URL
      headline?: string;       // e.g., "Technology Company"
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

  // Future media types (Phase 3+)
  carousel?: {
    images: {
      url: string;
      order: number;           // Display order (0-indexed)
      alt?: string;            // Accessibility text
    }[];
  };
  video?: {
    url?: string;
    thumbnail?: string;
    duration?: number;         // Duration in seconds
  };
  document?: {
    url?: string;
    title?: string;
    thumbnail?: string;        // First page preview for PDFs
  };
  poll?: {
    question: string;
    options: string[];
    duration: number;          // Days: 1-14
  };

  // Widget configuration
  phase1Features: {
    allowImageUpload: boolean;
    allowAiGeneration: boolean;
  };
}

export interface GenerateImageOutput {
  success: boolean;
  imageUrl?: string;      // Public URL from Cloudflare R2 storage (Phase 2) or temporary DALL-E URL (Phase 2 integration)
  imageKey?: string;      // Storage key for future cleanup
  revisedPrompt?: string; // DALL-E's revised/enhanced version of the prompt
  error?: string;
}

export interface UploadImageOutput {
  success: boolean;
  imageUrl?: string;      // Public URL from R2
  imageKey?: string;      // Storage key
  error?: string;
}

export interface UploadCarouselImagesOutput {
  success: boolean;
  images?: {
    url: string;          // Public URL from R2
    imageKey: string;     // Storage key
    order: number;        // Display order
  }[];
  error?: string;
  message?: string;
}

export interface PublishPostOutput {
  success: boolean;
  postId?: string;        // LinkedIn post URN
  postUrl?: string;       // Public URL to view published post
  message: string;        // Success/error message
  error?: string;
}
