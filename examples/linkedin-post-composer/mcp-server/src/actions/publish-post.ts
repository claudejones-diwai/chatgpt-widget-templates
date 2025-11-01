import type { PublishPostOutput } from '../../../shared-types';
import { publishToLinkedIn } from '../integrations/linkedin-api';

export interface PublishPostParams {
  accountId: string;
  content: string;
  imageUrl?: string;
  postType: 'text' | 'image';
}

export async function handlePublishPost(params: PublishPostParams): Promise<PublishPostOutput> {
  const { accountId, content, imageUrl, postType } = params;

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

  // Publish post (stub in Phase 1)
  const result = await publishToLinkedIn({
    accountId,
    content,
    imageUrl,
    postType
  });

  return result;
}
