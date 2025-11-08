import type { PublishPostOutput } from '../../../shared-types';
import { LinkedInPostsAPI } from '../integrations/linkedin-posts-api';
import { LinkedInMultiImageAPI } from '../integrations/linkedin-multiimage-api';
import { LinkedInDocumentsAPI } from '../integrations/linkedin-documents-api';
import { LinkedInVideosAPI } from '../integrations/linkedin-videos-api';
import type { Env } from '../index';

export interface PublishPostParams {
  accountId: string;
  content: string;
  imageUrl?: string;
  carouselImageUrls?: string[];  // For carousel posts (2-20 images)
  documentUrl?: string;  // For document posts
  videoUrl?: string;  // For video posts
  postType: 'text' | 'image' | 'carousel' | 'document' | 'video';
}

export async function handlePublishPost(params: PublishPostParams, env: Env): Promise<PublishPostOutput> {
  const { accountId, content, imageUrl, carouselImageUrls, documentUrl, videoUrl, postType } = params;

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

  // Validate video for video posts
  if (postType === 'video' && !videoUrl) {
    return {
      success: false,
      message: 'Video URL is required for video posts',
      error: 'VIDEO_REQUIRED'
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
    // Check if imageUrl is a data URI (base64 encoded image from upload)
    // OR an R2 URL (from AI-generated images)
    if (imageUrl.startsWith('data:')) {
      console.log('Image is data URI, uploading directly to LinkedIn...');

      // Upload directly to LinkedIn (documents, manual uploads)
      imageUrn = await linkedInAPI.uploadImageFromDataUri(userId, imageUrl, accountId) || undefined;

      if (!imageUrn) {
        return {
          success: false,
          message: 'Failed to upload image to LinkedIn',
          error: 'IMAGE_UPLOAD_FAILED'
        };
      }
    } else if (imageUrl.startsWith('http')) {
      console.log('Image is R2 URL, uploading from R2 to LinkedIn...');

      // Upload from R2 (AI-generated images)
      imageUrn = await linkedInAPI.uploadImage(userId, imageUrl, accountId) || undefined;

      if (!imageUrn) {
        return {
          success: false,
          message: 'Failed to upload image to LinkedIn',
          error: 'IMAGE_UPLOAD_FAILED'
        };
      }
    } else {
      // Invalid image source
      return {
        success: false,
        message: 'Image must be provided as data URI or HTTP URL',
        error: 'INVALID_IMAGE_SOURCE'
      };
    }
  }

  // Handle carousel posts - DIRECT UPLOAD (no R2)
  if (postType === 'carousel' && carouselImageUrls && carouselImageUrls.length >= 2) {
    const multiImageAPI = new LinkedInMultiImageAPI(env);

    // Upload all carousel images directly to LinkedIn (no R2)
    const carouselImageUrns: string[] = [];

    for (const imageUrl of carouselImageUrls) {
      // All images should be data URIs now
      if (!imageUrl.startsWith('data:')) {
        return {
          success: false,
          message: 'Carousel images must be provided as data URIs',
          error: 'INVALID_CAROUSEL_IMAGE_SOURCE'
        };
      }

      // Upload directly to LinkedIn
      const urn = await linkedInAPI.uploadImageFromDataUri(userId, imageUrl, accountId);
      if (!urn) {
        return {
          success: false,
          message: 'Failed to upload one or more carousel images to LinkedIn',
          error: 'CAROUSEL_IMAGE_UPLOAD_FAILED'
        };
      }

      // Convert digitalmediaAsset URN to image URN for REST Posts API
      // Assets API returns urn:li:digitalmediaAsset:XXX
      // REST Posts API requires urn:li:image:XXX
      // LinkedIn uses the same ID for both URN types
      const imageUrn = urn.replace('digitalmediaAsset', 'image');
      carouselImageUrns.push(imageUrn);
    }

    console.log(`Uploaded ${carouselImageUrns.length} carousel images directly to LinkedIn`);

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

  // Handle document posts - DIRECT UPLOAD (no R2)
  if (postType === 'document' && documentUrl) {
    try {
      const documentsAPI = new LinkedInDocumentsAPI(env);

      // If documentUrl is a data URI, upload directly to LinkedIn (skip R2)
      if (documentUrl.startsWith('data:')) {
        console.log('Document is data URI, uploading directly to LinkedIn...');

        // Parse the data URI
        const matches = documentUrl.match(/^data:([^;]+);base64,(.+)$/);

        if (!matches) {
          return {
            success: false,
            message: 'Invalid document data format',
            error: 'INVALID_DOCUMENT_FORMAT'
          };
        }

        const contentType = matches[1];

        // Generate document title based on content type
        let extension = 'pdf';
        if (contentType.includes('word')) {
          extension = contentType.includes('openxmlformats') ? 'docx' : 'doc';
        } else if (contentType.includes('presentation') || contentType.includes('powerpoint')) {
          extension = contentType.includes('openxmlformats') ? 'pptx' : 'ppt';
        }

        const documentTitle = `Document.${extension}`;

        // Upload directly to LinkedIn (no R2)
        const result = await documentsAPI.uploadAndCreatePostFromDataUri({
          userId,
          dataUri: documentUrl,
          contentType,
          authorUrn: accountId,
          title: documentTitle,
          content,
        });

        if (result.success) {
          return {
            success: true,
            postId: result.postId,
            postUrl: result.postUrl,
            message: 'Document post published successfully to LinkedIn!',
          };
        } else {
          return {
            success: false,
            message: result.error || 'Failed to publish document post',
            error: result.error,
          };
        }
      }

      // Fallback for non-data-URI documents (if needed)
      return {
        success: false,
        message: 'Document must be provided as data URI',
        error: 'INVALID_DOCUMENT_SOURCE'
      };
    } catch (error: any) {
      console.error('Unexpected error in document post flow:', error);
      return {
        success: false,
        message: 'Unexpected error while publishing document post: ' + error.message,
        error: error.message,
      };
    }
  }

  // Handle video posts - DIRECT UPLOAD (no R2)
  if (postType === 'video' && videoUrl) {
    try {
      const videosAPI = new LinkedInVideosAPI(env);

      // If videoUrl is a data URI, upload directly to LinkedIn (skip R2)
      if (videoUrl.startsWith('data:')) {
        console.log('Video is data URI, uploading directly to LinkedIn...');

        // Parse the data URI to get content type
        const matches = videoUrl.match(/^data:([^;]+);base64,(.+)$/);

        if (!matches) {
          return {
            success: false,
            message: 'Invalid video data format',
            error: 'INVALID_VIDEO_FORMAT'
          };
        }

        const contentType = matches[1];

        // Generate video title based on content type
        let extension = 'mp4';
        if (contentType.includes('quicktime')) {
          extension = 'mov';
        } else if (contentType.includes('x-msvideo')) {
          extension = 'avi';
        } else if (contentType.includes('x-ms-wmv')) {
          extension = 'wmv';
        } else if (contentType.includes('x-flv')) {
          extension = 'flv';
        } else if (contentType.includes('webm')) {
          extension = 'webm';
        }

        const videoTitle = `Video.${extension}`;

        // Upload directly to LinkedIn (no R2)
        const result = await videosAPI.uploadAndCreatePostFromDataUri({
          userId,
          dataUri: videoUrl,
          authorUrn: accountId,
          title: videoTitle,
          content,
        });

        if (result.success) {
          return {
            success: true,
            postId: result.postId,
            postUrl: result.postUrl,
            message: 'Video post published successfully to LinkedIn!',
          };
        } else {
          return {
            success: false,
            message: result.error || 'Failed to publish video post',
            error: result.error,
          };
        }
      }

      // Fallback for non-data-URI videos (if needed)
      return {
        success: false,
        message: 'Video must be provided as data URI',
        error: 'INVALID_VIDEO_SOURCE'
      };
    } catch (error: any) {
      console.error('Unexpected error in video post flow:', error);
      return {
        success: false,
        message: 'Unexpected error while publishing video post: ' + error.message,
        error: error.message,
      };
    }
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
