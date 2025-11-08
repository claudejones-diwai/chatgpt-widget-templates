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
      // Using LinkedIn REST Posts API format
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
            images: args.imageUrns.map((urn, index) => ({
              id: urn,
              // Optional: add alt text for accessibility
              altText: `Image ${index + 1}`
            }))
          }
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      };

      console.log(`Creating multi-image post with ${args.imageUrns.length} images`);

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

      console.log('Create multi-image post response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn multi-image post creation failed:', response.status, error);
        return {
          success: false,
          error: `Failed to create post: ${response.statusText}`,
        };
      }

      const responseText = await response.text();
      console.log('Create post response body length:', responseText.length);

      // LinkedIn may return the post ID in headers instead of body
      let postId: string | undefined;

      // Handle empty response (LinkedIn sometimes returns 201 Created with empty body and ID in headers)
      if (!responseText || responseText.trim().length === 0) {
        console.log('Empty response body - checking headers for post ID');

        // Check for post ID in common header locations
        const locationHeader = response.headers.get('location');
        const xLinkedInId = response.headers.get('x-linkedin-id');
        const xRestliId = response.headers.get('x-restli-id');

        console.log('Location header:', locationHeader);
        console.log('x-linkedin-id header:', xLinkedInId);
        console.log('x-restli-id header:', xRestliId);

        // Try to extract ID from Location header (format: .../posts/{id} or urn:li:share:{id})
        if (locationHeader) {
          const locationMatch = locationHeader.match(/\/posts\/([^\/\?]+)/);
          if (locationMatch) {
            postId = locationMatch[1];
            console.log('Extracted post ID from Location header:', postId);
          }
        }

        // Try other header fields
        if (!postId && xLinkedInId) {
          postId = xLinkedInId;
          console.log('Using x-linkedin-id header:', postId);
        }

        if (!postId && xRestliId) {
          postId = xRestliId;
          console.log('Using x-restli-id header:', postId);
        }

        if (!postId) {
          console.error('No post ID found in headers or body');
          return {
            success: false,
            error: 'LinkedIn API returned empty response with no post ID in headers',
          };
        }
      } else {
        // Parse response body to get post ID
        let postData: any;
        try {
          postData = JSON.parse(responseText);
          console.log('Multi-image post created successfully, postId:', postData?.id);
          postId = postData.id;
        } catch (parseError: any) {
          console.error('Failed to parse LinkedIn create post response:', parseError.message);
          console.error('Response text length:', responseText.length);
          console.error('First 200 chars:', responseText.substring(0, 200));
          return {
            success: false,
            error: `Failed to parse LinkedIn API response: ${parseError.message}`,
          };
        }
      }

      if (!postId) {
        console.error('No post ID available after parsing');
        return {
          success: false,
          error: 'Failed to extract post ID from LinkedIn response',
        };
      }

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
