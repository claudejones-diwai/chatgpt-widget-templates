// LinkedIn Posts API Integration
// Handles fetching accounts and publishing posts to LinkedIn

import { Env } from '../index';
import { LinkedInOAuth } from '../oauth/linkedin';

// LinkedIn API response types
export interface LinkedInProfile {
  sub: string;          // LinkedIn person URN
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export interface LinkedInOrganization {
  organizationalTarget: string;  // Organization URN
  role: string;
  state: string;
}

export interface LinkedInOrganizationDetail {
  localizedName: string;
  vanityName: string;
  organizationId: number;
}

// Our formatted account types
export interface PersonalAccount {
  id: string;              // URN: urn:li:person:xxx
  name: string;
  profileUrl: string;
  avatarUrl?: string;      // Profile picture URL
  headline?: string;       // User's professional headline
}

export interface OrganizationAccount {
  id: string;              // URN: urn:li:organization:xxx
  name: string;
  pageUrl: string;
  logoUrl?: string;
}

export interface LinkedInAccounts {
  personal: PersonalAccount;
  organizations: OrganizationAccount[];
}

export interface PublishPostArgs {
  author: string;          // URN of person or organization
  content: string;
  imageUrn?: string;       // Image URN from LinkedIn's image upload
}

export interface PublishPostResponse {
  success: boolean;
  postId?: string;         // LinkedIn post URN
  postUrl?: string;        // Public URL to view post
  error?: string;
}

export class LinkedInPostsAPI {
  constructor(private env: Env) {}

  /**
   * Get access token for a user from KV storage
   */
  private async getAccessToken(userId: string): Promise<string | null> {
    const oauth = new LinkedInOAuth(this.env);
    return await oauth.getToken(userId);
  }

  /**
   * Fetch user's personal profile
   */
  async getPersonalProfile(userId: string): Promise<PersonalAccount | null> {
    const accessToken = await this.getAccessToken(userId);

    if (!accessToken) {
      console.error('No access token found for user:', userId);
      return null;
    }

    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'LinkedIn-Version': '202304',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn profile fetch failed:', error);
        return null;
      }

      const profile: LinkedInProfile = await response.json();

      return {
        id: `urn:li:person:${profile.sub}`,
        name: profile.name,
        profileUrl: `https://www.linkedin.com/in/me/`, // Generic profile URL
        avatarUrl: profile.picture,
        headline: undefined, // TODO: Fetch from LinkedIn profile API if needed
      };
    } catch (error: any) {
      console.error('Error fetching personal profile:', error);
      return null;
    }
  }

  /**
   * Fetch organizations user can post to using new REST API
   */
  async getOrganizations(userId: string): Promise<OrganizationAccount[]> {
    const accessToken = await this.getAccessToken(userId);

    if (!accessToken) {
      console.error('No access token found for user:', userId);
      return [];
    }

    // Debug: Check what scopes are in the stored token
    const tokenData = await this.env.OAUTH_TOKENS.get(`linkedin:${userId}`);
    if (tokenData) {
      const parsed = JSON.parse(tokenData);
      console.log('Token scopes:', parsed.scope);
    }

    try {
      // Use organizationAcls endpoint with roleAssignee query
      // This returns organizations where the user has admin access
      console.log('Fetching organizations for user:', userId);
      const authResponse = await fetch(
        'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': '202411',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      console.log('Organizations API response status:', authResponse.status);

      if (!authResponse.ok) {
        const error = await authResponse.text();
        console.error('LinkedIn organizations fetch failed. Status:', authResponse.status, 'Error:', error);
        return [];
      }

      const authData: any = await authResponse.json();

      // Extract organization URNs from response
      const elements = authData.elements || [];

      if (elements.length === 0) {
        console.log('No organizations found with admin access');
        return [];
      }

      // Fetch details for each organization separately
      const organizations: OrganizationAccount[] = [];

      for (const element of elements) {
        try {
          // element.organization is the URN (e.g., urn:li:organization:12345)
          const orgUrn = element.organization;

          if (!orgUrn) {
            console.warn('Missing organization URN in element:', element);
            continue;
          }

          // Extract organization ID from URN
          const orgId = orgUrn.split(':').pop();

          console.log(`Fetching details for organization: ${orgUrn}`);

          // Fetch organization details
          const orgResponse = await fetch(
            `https://api.linkedin.com/rest/organizations/${orgId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'LinkedIn-Version': '202411',
                'X-Restli-Protocol-Version': '2.0.0',
              },
            }
          );

          if (orgResponse.ok) {
            const orgDetails: any = await orgResponse.json();

            const orgName = orgDetails.localizedName || orgDetails.name?.localized?.en_US || 'Unknown Organization';
            const vanityName = orgDetails.vanityName || '';

            // Extract logo URL by resolving digitalmediaAsset URN
            let logoUrl: string | undefined;

            if (orgDetails.logoV2?.cropped) {
              const mediaUrn = orgDetails.logoV2.cropped;

              // Convert urn:li:digitalmediaAsset:XXX to urn:li:image:XXX
              // LinkedIn hack: digitalmediaAsset ID is the same as image ID
              const imageUrn = mediaUrn.replace('digitalmediaAsset', 'image');

              console.log(`Resolving logo for ${orgName}: ${mediaUrn} -> ${imageUrn}`);

              try {
                // Fetch the actual image URL from LinkedIn Images API
                const imageResponse = await fetch(
                  `https://api.linkedin.com/rest/images/${encodeURIComponent(imageUrn)}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'LinkedIn-Version': '202411',
                      'X-Restli-Protocol-Version': '2.0.0',
                    },
                  }
                );

                if (imageResponse.ok) {
                  const imageData: any = await imageResponse.json();
                  logoUrl = imageData.downloadUrl;
                  console.log(`Successfully resolved logo URL for ${orgName}`);
                } else {
                  console.warn(`Failed to resolve logo for ${orgName}: ${imageResponse.status}`);
                }
              } catch (error) {
                console.error(`Error resolving logo for ${orgName}:`, error);
              }
            }

            organizations.push({
              id: orgUrn,
              name: orgName,
              pageUrl: vanityName ? `https://www.linkedin.com/company/${vanityName}` : '',
              logoUrl,
            });
          } else {
            const error = await orgResponse.text();
            console.error(`Failed to fetch organization ${orgId}:`, error);
          }
        } catch (error) {
          console.error('Error processing organization element:', error, element);
        }
      }

      console.log(`Found ${organizations.length} organizations with posting permissions`);
      return organizations;
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }

  /**
   * Get all accounts (personal + organizations) for user
   */
  async getAccounts(userId: string): Promise<LinkedInAccounts | null> {
    const personal = await this.getPersonalProfile(userId);

    if (!personal) {
      return null;
    }

    const organizations = await this.getOrganizations(userId);

    return {
      personal,
      organizations,
    };
  }

  /**
   * Upload image to LinkedIn from data URI (direct upload)
   * Returns image URN that can be used in post
   * @param authorUrn - The URN of the author (person or organization) who will own the image
   */
  async uploadImageFromDataUri(userId: string, dataUri: string, authorUrn: string): Promise<string | null> {
    const accessToken = await this.getAccessToken(userId);

    if (!accessToken) {
      console.error('No access token found for user:', userId);
      return null;
    }

    try {
      // Parse data URI
      const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        console.error('Invalid data URI format');
        return null;
      }

      const contentType = matches[1];
      const base64Data = matches[2];

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('Uploading image directly to LinkedIn, size:', bytes.length, 'bytes');

      // Register image upload with LinkedIn
      const registerResponse = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202304',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: authorUrn,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          }),
        }
      );

      if (!registerResponse.ok) {
        const error = await registerResponse.text();
        console.error('LinkedIn image registration failed:', error);
        return null;
      }

      const registerData: any = await registerResponse.json();
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerData.value.asset;

      // Upload image binary data
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: bytes,
      });

      if (!uploadResponse.ok) {
        console.error('LinkedIn image upload failed:', uploadResponse.status);
        return null;
      }

      console.log('Image uploaded successfully to LinkedIn');
      return asset; // Return the image URN
    } catch (error: any) {
      console.error('Error uploading image from data URI to LinkedIn:', error);
      return null;
    }
  }

  /**
   * Upload image to LinkedIn (required before posting)
   * Returns image URN that can be used in post
   * @param authorUrn - The URN of the author (person or organization) who will own the image
   */
  async uploadImage(userId: string, imageUrl: string, authorUrn: string): Promise<string | null> {
    const accessToken = await this.getAccessToken(userId);

    if (!accessToken) {
      console.error('No access token found for user:', userId);
      return null;
    }

    try {
      // Step 1: Get image from R2 directly (extract key from URL)
      // URL format: https://linkedin-post-composer-mcp.claude-8f5.workers.dev/images/linkedin-posts/123-file.png
      // Key format: linkedin-posts/123-file.png
      const imageKey = imageUrl.split('/images/')[1];

      if (!imageKey) {
        console.error('Invalid image URL format:', imageUrl);
        return null;
      }

      console.log('Fetching image from R2 with key:', imageKey);

      // Read directly from R2 bucket
      const imageObject = await this.env.IMAGE_BUCKET.get(imageKey);

      if (!imageObject) {
        console.error('Image not found in R2:', imageKey);
        return null;
      }

      const imageData = await imageObject.arrayBuffer();

      // Step 2: Register image upload with LinkedIn
      // Use the provided authorUrn (can be person or organization)
      console.log('Registering image upload for author:', authorUrn);

      const registerResponse = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202304',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: authorUrn,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          }),
        }
      );

      if (!registerResponse.ok) {
        const error = await registerResponse.text();
        console.error('LinkedIn image registration failed:', error);
        return null;
      }

      const registerData: any = await registerResponse.json();
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerData.value.asset;

      // Step 3: Upload image binary data
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: imageData,
      });

      if (!uploadResponse.ok) {
        console.error('LinkedIn image upload failed');
        return null;
      }

      return asset; // Return the image URN
    } catch (error: any) {
      console.error('Error uploading image to LinkedIn:', error);
      return null;
    }
  }

  /**
   * Publish a post to LinkedIn using REST Posts API
   * Supports text posts and single-image posts
   */
  async publishPost(userId: string, args: PublishPostArgs): Promise<PublishPostResponse> {
    const accessToken = await this.getAccessToken(userId);

    if (!accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please connect your LinkedIn account.',
      };
    }

    try {
      // Convert digitalmediaAsset URN to image URN if present
      // REST Posts API requires urn:li:image:XXX format
      let imageUrn = args.imageUrn;
      if (imageUrn && imageUrn.includes('digitalmediaAsset')) {
        imageUrn = imageUrn.replace('digitalmediaAsset', 'image');
        console.log('Converted URN for REST Posts API:', imageUrn);
      }

      // Build REST Posts API payload
      const payload: any = {
        author: args.author,
        commentary: args.content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      };

      // Add single image if provided
      if (imageUrn) {
        payload.content = {
          media: {
            id: imageUrn
          }
        };
      }

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

      console.log('Create post response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn post creation failed:', response.status, error);
        return {
          success: false,
          error: `Failed to publish post: ${response.statusText}`,
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
          console.log('Post created successfully, postId:', postData?.id);
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

      // Construct post URL
      const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

      console.log('Post published successfully via REST Posts API:', postId);

      return {
        success: true,
        postId,
        postUrl,
      };
    } catch (error: any) {
      console.error('Error publishing post:', error);
      return {
        success: false,
        error: error.message || 'Failed to publish post',
      };
    }
  }
}
