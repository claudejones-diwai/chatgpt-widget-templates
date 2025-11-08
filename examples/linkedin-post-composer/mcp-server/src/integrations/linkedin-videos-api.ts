// LinkedIn Videos API Integration
// Handles uploading videos and creating video posts
// Reference: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/videos-api?view=li-lms-2024-11

import { Env } from '../index';
import { LinkedInOAuth } from '../oauth/linkedin';

/**
 * LinkedIn Videos API - Initialize Upload
 * Endpoint: POST https://api.linkedin.com/rest/videos?action=initializeUpload
 * API Version: 202411 (November 2024)
 *
 * Request:
 * {
 *   initializeUploadRequest: {
 *     owner: "urn:li:person:XXX" or "urn:li:organization:XXX",
 *     fileSizeBytes: number,
 *     uploadCaptions: false,
 *     uploadThumbnail: false
 *   }
 * }
 *
 * Response:
 * {
 *   value: {
 *     video: "urn:li:video:XXX",  // Video URN for creating post
 *     uploadInstructions: [{       // Array of upload URLs with byte ranges
 *       firstByte: 0,
 *       lastByte: 4194303,
 *       uploadUrl: "https://..."
 *     }],
 *     uploadToken: "...",           // Token for finalizeUpload
 *     uploadUrlsExpireAt: number
 *   }
 * }
 */

export interface InitializeVideoUploadResponse {
  uploadInstructions: UploadInstruction[];
  uploadUrlsExpireAt: number;
  videoUrn: string;
  uploadToken: string;
}

export interface UploadInstruction {
  firstByte: number;
  lastByte: number;
  uploadUrl: string;
}

export interface UploadVideoArgs {
  userId: string;
  videoUrl: string;    // Data URI of the video
  authorUrn: string;   // URN of person or organization (video owner)
  title: string;       // Video title for the post
}

export interface CreateVideoPostArgs {
  userId: string;
  authorUrn: string;
  content: string;
  videoUrn: string;
  videoTitle: string;
}

export interface VideoPostResponse {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export class LinkedInVideosAPI {
  constructor(private env: Env) {}

  /**
   * Get access token for a user from KV storage
   */
  private async getAccessToken(userId: string): Promise<string | null> {
    const oauth = new LinkedInOAuth(this.env);
    return await oauth.getToken(userId);
  }

  /**
   * Initialize video upload with LinkedIn
   * Returns upload instructions, video URN, and upload token
   */
  private async initializeUpload(
    accessToken: string,
    ownerUrn: string,
    fileSizeBytes: number
  ): Promise<InitializeVideoUploadResponse | null> {
    try {
      console.log('Initializing video upload for owner:', ownerUrn, 'size:', fileSizeBytes, 'bytes');

      const response = await fetch(
        'https://api.linkedin.com/rest/videos?action=initializeUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': '202411',  // Current version in YYYYMM format (November 2024)
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initializeUploadRequest: {
              owner: ownerUrn,
              fileSizeBytes,
              uploadCaptions: false,  // Not supporting captions in Phase 1
              uploadThumbnail: false, // Not supporting custom thumbnails in Phase 1
            },
          }),
        }
      );

      console.log('Initialize upload response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn video upload initialization failed:', response.status, error);
        return null;
      }

      const responseText = await response.text();

      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('Video upload initialized successfully, video URN:', data.value.video);
      } catch (parseError: any) {
        console.error('Failed to parse LinkedIn initialize upload response:', parseError);
        console.error('Response was:', responseText);
        return null;
      }

      return {
        uploadInstructions: data.value.uploadInstructions,
        uploadUrlsExpireAt: data.value.uploadUrlsExpireAt,
        videoUrn: data.value.video,
        uploadToken: data.value.uploadToken,
      };
    } catch (error: any) {
      console.error('Error initializing video upload:', error);
      return null;
    }
  }

  /**
   * Finalize video upload
   * Must be called after uploading all video parts
   */
  private async finalizeUpload(
    accessToken: string,
    videoUrn: string,
    uploadToken: string,
    uploadedPartIds: string[]
  ): Promise<boolean> {
    try {
      console.log('Finalizing video upload for:', videoUrn);

      const response = await fetch(
        'https://api.linkedin.com/rest/videos?action=finalizeUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': '202411',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            finalizeUploadRequest: {
              video: videoUrn,
              uploadToken,
              uploadedPartIds,
            },
          }),
        }
      );

      console.log('Finalize upload response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn video finalization failed:', response.status, error);
        return false;
      }

      console.log('Video upload finalized successfully');
      return true;
    } catch (error: any) {
      console.error('Error finalizing video upload:', error);
      return false;
    }
  }

  /**
   * Upload video to LinkedIn from data URI
   * Returns video URN that can be used in post
   * @param authorUrn - The URN of the author (person or organization) who will own the video
   */
  async uploadVideoFromDataUri(userId: string, dataUri: string, authorUrn: string): Promise<string | null> {
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

      // Validate content type
      if (!contentType.startsWith('video/')) {
        console.error('Invalid content type. Expected video/*, got:', contentType);
        return null;
      }

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const fileSizeBytes = bytes.length;
      console.log('Uploading video directly to LinkedIn, size:', fileSizeBytes, 'bytes');

      // Validate file size (75KB to 5GB)
      if (fileSizeBytes < 75 * 1024) {
        console.error('Video too small. Minimum size: 75KB');
        return null;
      }

      if (fileSizeBytes > 5 * 1024 * 1024 * 1024) {
        console.error('Video too large. Maximum size: 5GB');
        return null;
      }

      // Step 1: Initialize upload
      const uploadInfo = await this.initializeUpload(accessToken, authorUrn, fileSizeBytes);

      if (!uploadInfo) {
        console.error('Failed to initialize video upload');
        return null;
      }

      console.log(`Uploading video in ${uploadInfo.uploadInstructions.length} part(s)`);

      // Step 2: Upload video parts
      const uploadedPartIds: string[] = [];

      for (const instruction of uploadInfo.uploadInstructions) {
        console.log(`Uploading part: bytes ${instruction.firstByte}-${instruction.lastByte}`);

        // Extract the byte range for this part
        const partData = bytes.slice(instruction.firstByte, instruction.lastByte + 1);

        const uploadResponse = await fetch(instruction.uploadUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': contentType,
          },
          body: partData,
        });

        console.log('Part upload response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const error = await uploadResponse.text();
          console.error('LinkedIn video part upload failed:', uploadResponse.status, error);
          return null;
        }

        // Get ETag from response headers
        const etag = uploadResponse.headers.get('ETag');
        if (etag) {
          uploadedPartIds.push(etag);
          console.log('Part uploaded successfully, ETag:', etag);
        } else {
          console.warn('No ETag in upload response, using empty string');
          uploadedPartIds.push('');
        }
      }

      // Step 3: Finalize upload
      const finalized = await this.finalizeUpload(
        accessToken,
        uploadInfo.videoUrn,
        uploadInfo.uploadToken,
        uploadedPartIds
      );

      if (!finalized) {
        console.error('Failed to finalize video upload');
        return null;
      }

      console.log('Video uploaded successfully, URN:', uploadInfo.videoUrn);
      return uploadInfo.videoUrn; // Return urn:li:video:XXX (NO conversion needed!)
    } catch (error: any) {
      console.error('Error uploading video from data URI to LinkedIn:', error);
      console.error('Error stack:', error.stack);
      return null;
    }
  }

  /**
   * Create a post with a video using the REST Posts API
   *
   * Payload format:
   * {
   *   author: "urn:li:person:XXX",
   *   commentary: "post text",
   *   content: {
   *     media: {
   *       title: "video title",
   *       id: "urn:li:video:XXX"
   *     }
   *   },
   *   ...
   * }
   */
  async createVideoPost(args: CreateVideoPostArgs): Promise<VideoPostResponse> {
    const accessToken = await this.getAccessToken(args.userId);

    if (!accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please connect your LinkedIn account.',
      };
    }

    try {
      console.log('Creating video post with URN:', args.videoUrn);

      // Build post payload using REST Posts API format
      const payload: any = {
        author: args.authorUrn,
        commentary: args.content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        content: {
          media: {
            title: args.videoTitle,
            id: args.videoUrn,  // urn:li:video:XXX (NO conversion needed!)
          },
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      };

      const response = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'LinkedIn-Version': '202411',  // Current version for Posts API (November 2024)
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Create post response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn video post creation failed:', response.status, error);
        return {
          success: false,
          error: `Failed to create video post: ${response.statusText}`,
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
          console.log('Video post created successfully, postId:', postData?.id);
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

      return {
        success: true,
        postId,
        postUrl,
      };
    } catch (error: any) {
      console.error('Error creating video post:', error);
      return {
        success: false,
        error: error.message || 'Failed to create video post',
      };
    }
  }

  /**
   * Complete flow: Upload video and create post from data URI
   */
  async uploadAndCreatePostFromDataUri(args: {
    userId: string;
    dataUri: string;
    authorUrn: string;
    title: string;
    content: string;
  }): Promise<VideoPostResponse> {
    try {
      console.log('[uploadAndCreatePostFromDataUri] Starting direct video upload');

      // Step 1: Upload video to LinkedIn
      const videoUrn = await this.uploadVideoFromDataUri(args.userId, args.dataUri, args.authorUrn);

      if (!videoUrn) {
        return {
          success: false,
          error: 'Failed to upload video to LinkedIn',
        };
      }

      console.log('[uploadAndCreatePostFromDataUri] Video uploaded, creating post...');

      // Step 2: Create post with video
      const result = await this.createVideoPost({
        userId: args.userId,
        authorUrn: args.authorUrn,
        content: args.content,
        videoUrn,
        videoTitle: args.title,
      });

      return result;
    } catch (error: any) {
      console.error('[uploadAndCreatePostFromDataUri] Error:', error);
      return {
        success: false,
        error: error.message || 'Unexpected error during video upload',
      };
    }
  }
}
