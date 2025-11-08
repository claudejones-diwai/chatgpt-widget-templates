import type { UploadImageOutput } from '../../../shared-types';
import { R2ImageStorage } from '../integrations/r2-storage';
import type { Env } from '../index';

export interface UploadImageParams {
  image: string;      // base64 encoded image data (with data:image/... prefix)
  filename: string;
}

export async function handleUploadImage(params: UploadImageParams, env: Env): Promise<UploadImageOutput> {
  const { image, filename } = params;

  // Validate filename extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      success: false,
      error: 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp'
    };
  }

  try {
    // Validate base64 data URL format
    // Format: data:image/png;base64,iVBORw0KGgoAAAANS...
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);

    if (!matches) {
      return {
        success: false,
        error: 'Invalid image data format. Expected base64 data URL.'
      };
    }

    const contentType = matches[1];

    // Validate it's an image content type
    if (!contentType.startsWith('image/')) {
      return {
        success: false,
        error: 'Invalid content type. Expected image/*'
      };
    }

    console.log('Image validated, returning data URI for direct upload');

    // Return the data URI directly (no R2 upload)
    // The publish_post handler will upload directly to LinkedIn when creating the post
    return {
      success: true,
      imageUrl: image, // Return the data URI itself
      imageKey: filename, // Use filename as a reference
    };
  } catch (error: any) {
    console.error('Image validation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate image'
    };
  }
}
