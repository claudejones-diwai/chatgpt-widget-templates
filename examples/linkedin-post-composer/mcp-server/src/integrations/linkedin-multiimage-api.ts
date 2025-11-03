// LinkedIn MultiImage Posts API Integration
// Handles carousel posts with 2-20 images

import { Env } from '../index';
import { LinkedInOAuth } from '../oauth/linkedin';

export interface MultiImagePostArgs {
  author: string;           // URN of person or organization
  content: string;          // Post text
  imageUrns: string[];      // Array of 2-20 image URNs from LinkedIn's image upload
}

export interface MultiImagePostResponse {
  success: boolean;
  postId?: string;          // LinkedIn post URN
  postUrl?: string;         // Public URL to view post
  error?: string;
}

export class LinkedInMultiImageAPI {
  constructor(private env: Env) {}

  /**
   * Get access token for a user from KV storage
   */
  private async getAccessToken(userId: string): Promise<string | null> {
    const oauth = new LinkedInOAuth(this.env);
    return await oauth.getToken(userId);
  }

  /**
   * Create a multi-image post on LinkedIn
   * Uses the Posts API with multiImage content
   */
  async createMultiImagePost(userId: string, args: MultiImagePostArgs): Promise<MultiImagePostResponse> {
    const accessToken = await this.getAccessToken(userId);

    if (!accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please connect your LinkedIn account.',
      };
    }

    // Validate: 2-20 images
    if (args.imageUrns.length < 2) {
      return {
        success: false,
        error: 'Multi-image posts require at least 2 images',
      };
    }

    if (args.imageUrns.length > 20) {
      return {
        success: false,
        error: 'Multi-image posts support maximum 20 images',
      };
    }

    try {
      // Build multi-image post payload
      const payload: any = {
        author: args.author,
        commentary: args.content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        content: {
          multiImage: {
            images: args.imageUrns.map(urn => ({
              id: urn
            }))
          }
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      };

      console.log('Creating multi-image post:', {
        author: args.author,
        imageCount: args.imageUrns.length
      });

      const response = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202411',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn multi-image post creation failed:', error);
        return {
          success: false,
          error: `Failed to create post: ${response.statusText}`,
        };
      }

      const postData: any = await response.json();
      const postId = postData.id;

      // Construct approximate post URL
      const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

      console.log('Multi-image post created successfully:', postId);

      return {
        success: true,
        postId,
        postUrl,
      };
    } catch (error: any) {
      console.error('Error creating multi-image post:', error);
      return {
        success: false,
        error: error.message || 'Failed to create post',
      };
    }
  }
}
