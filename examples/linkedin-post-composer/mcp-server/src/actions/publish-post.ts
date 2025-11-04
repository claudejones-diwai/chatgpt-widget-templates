import type { PublishPostOutput } from '../../../shared-types';
import { LinkedInPostsAPI } from '../integrations/linkedin-posts-api';
import { LinkedInMultiImageAPI } from '../integrations/linkedin-multiimage-api';
import type { Env } from '../index';

export interface PublishPostParams {
  accountId: string;
  content: string;
  imageUrl?: string;
  carouselImageUrls?: string[];  // For carousel posts (2-20 images)
  documentUrl?: string;  // For document posts
  postType: 'text' | 'image' | 'carousel' | 'document';
}

export async function handlePublishPost(params: PublishPostParams, env: Env): Promise<PublishPostOutput> {
  const { accountId, content, imageUrl, carouselImageUrls, documentUrl, postType } = params;

  // Validate content
  if (!content || content.trim().length === 0) {
    return {
      success: false,
      message: 'Post content cannot be empty',
      error: 'CONTENT_EMPTY'
    };
  }

  if (content.length > 3000) {
    return {
      success: false,
      message: 'Post content must be 3000 characters or less',
      error: 'CONTENT_TOO_LONG'
    };
  }

  // Validate image for image posts
  if (postType === 'image' && !imageUrl) {
    return {
      success: false,
      message: 'Image URL is required for image posts',
      error: 'IMAGE_REQUIRED'
    };
  }

  // Validate carousel images
  if (postType === 'carousel') {
    if (!carouselImageUrls || carouselImageUrls.length < 2) {
      return {
        success: false,
        message: 'Carousel posts require at least 2 images',
        error: 'CAROUSEL_TOO_FEW_IMAGES'
      };
    }
    if (carouselImageUrls.length > 20) {
      return {
        success: false,
        message: 'Carousel posts support maximum 20 images',
        error: 'CAROUSEL_TOO_MANY_IMAGES'
      };
    }
  }

  // Validate document for document posts
  if (postType === 'document' && !documentUrl) {
    return {
      success: false,
      message: 'Document URL is required for document posts',
      error: 'DOCUMENT_REQUIRED'
    };
  }

  // Get authenticated user ID from KV storage
  const userId = await getAuthenticatedUserId(env);

  if (!userId) {
    return {
      success: false,
      message: 'Not authenticated. Please authenticate with LinkedIn first.',
      error: 'NOT_AUTHENTICATED'
    };
  }

  // Upload image to LinkedIn if present
  const linkedInAPI = new LinkedInPostsAPI(env);
  let imageUrn: string | undefined;

  if (imageUrl) {
    let r2ImageUrl = imageUrl;

    // Check if imageUrl is a data URI (base64 encoded image from upload)
    // If so, upload to R2 first
    if (imageUrl.startsWith('data:')) {
      console.log('Image is a data URI, uploading to R2 first...');

      const { R2ImageStorage } = await import('../integrations/r2-storage');
      const storage = new R2ImageStorage(env);

      // Parse the data URI
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);

      if (!matches) {
        return {
          success: false,
          message: 'Invalid image data format',
          error: 'INVALID_IMAGE_FORMAT'
        };
      }

      const contentType = matches[1];
      const base64Data = matches[2];

      // Convert base64 to Uint8Array (optimized for large files)
      const binaryString = atob(base64Data);
      const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));

      // Upload to R2
      const fileName = `upload-${Date.now()}.${contentType.split('/')[1]}`;
      const r2Result = await storage.uploadImage({
        imageData: bytes,
        fileName,
        contentType,
      });

      if (!r2Result.success) {
        return {
          success: false,
          message: 'Failed to upload image to storage',
          error: 'R2_UPLOAD_FAILED'
        };
      }

      r2ImageUrl = r2Result.publicUrl!;
      console.log('Image uploaded to R2:', r2ImageUrl);
    }

    // Now upload to LinkedIn with the R2 URL
    // Pass the accountId as the author/owner of the image
    imageUrn = await linkedInAPI.uploadImage(userId, r2ImageUrl, accountId) || undefined;

    if (!imageUrn) {
      return {
        success: false,
        message: 'Failed to upload image to LinkedIn',
        error: 'IMAGE_UPLOAD_FAILED'
      };
    }
  }

  // Handle carousel posts separately
  if (postType === 'carousel' && carouselImageUrls && carouselImageUrls.length >= 2) {
    const multiImageAPI = new LinkedInMultiImageAPI(env);

    // Upload all carousel images to LinkedIn
    const carouselImageUrns: string[] = [];

    for (const imageUrl of carouselImageUrls) {
      const urn = await linkedInAPI.uploadImage(userId, imageUrl, accountId);
      if (!urn) {
        return {
          success: false,
          message: 'Failed to upload one or more carousel images to LinkedIn',
          error: 'CAROUSEL_IMAGE_UPLOAD_FAILED'
        };
      }
      carouselImageUrns.push(urn);
    }

    // Create multi-image post
    const result = await multiImageAPI.createMultiImagePost(userId, {
      author: accountId,
      content,
      imageUrns: carouselImageUrns,
    });

    if (result.success) {
      return {
        success: true,
        postId: result.postId,
        postUrl: result.postUrl,
        message: `Carousel post with ${carouselImageUrns.length} images published successfully!`
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to publish carousel post',
        error: result.error
      };
    }
  }

  // Handle document posts
  if (postType === 'document' && documentUrl) {
    // TODO: Implement LinkedIn Documents API integration
    // Document posts require:
    // 1. Initialize document upload via LinkedIn Documents API
    // 2. Upload document binary to LinkedIn
    // 3. Get document URN
    // 4. Create post with document URN
    //
    // For now, return a placeholder indicating document upload is ready
    // but LinkedIn Documents API integration is needed
    return {
      success: false,
      message: 'Document post publishing requires LinkedIn Documents API integration (Phase 3.2). Document uploaded to R2 storage successfully at: ' + documentUrl,
      error: 'DOCUMENTS_API_NOT_IMPLEMENTED'
    };
  }

  // Publish single-image or text post using LinkedIn Posts API
  const result = await linkedInAPI.publishPost(userId, {
    author: accountId,  // User-selected account (personal or organization)
    content,
    imageUrn,
  });

  // Map PublishPostResponse to PublishPostOutput
  if (result.success) {
    return {
      success: true,
      postId: result.postId,
      postUrl: result.postUrl,
      message: 'Post published successfully to LinkedIn!'
    };
  } else {
    return {
      success: false,
      message: result.error || 'Failed to publish post',
      error: result.error
    };
  }
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
