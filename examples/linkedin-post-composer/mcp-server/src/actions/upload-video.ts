import type { UploadVideoOutput } from '../../../shared-types';
import type { Env } from '../index';

export interface UploadVideoParams {
  video: string;      // Base64 encoded video data (with data:video/... prefix)
  filename: string;
  fileType: string;   // MIME type
  fileSize: number;   // File size in bytes
}

export async function handleUploadVideo(params: UploadVideoParams, env: Env): Promise<UploadVideoOutput> {
  const { video, filename, fileType, fileSize } = params;

  // Validate filename extension
  const validExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
  const extension = filename.split('.').pop()?.toLowerCase();
  const hasValidExtension = extension && validExtensions.includes(extension);

  if (!hasValidExtension) {
    return {
      success: false,
      error: `Invalid file type for ${filename}. Allowed: ${validExtensions.join(', ')}`
    };
  }

  // Validate file size (75KB to 5GB per LinkedIn spec)
  const minSize = 75 * 1024; // 75KB
  const maxSize = 5 * 1024 * 1024 * 1024; // 5GB

  if (fileSize < minSize) {
    return {
      success: false,
      error: `Video file too small. Minimum size: 75KB`
    };
  }

  if (fileSize > maxSize) {
    return {
      success: false,
      error: `Video file too large. Maximum size: 5GB`
    };
  }

  try {
    // Validate base64 data URL format
    // Format: data:video/mp4;base64,AAAAIGZ0eXBpc29t...
    const matches = video.match(/^data:([^;]+);base64,(.+)$/);

    if (!matches) {
      return {
        success: false,
        error: 'Invalid video data format. Expected base64 data URL.'
      };
    }

    const contentType = matches[1];

    // Validate it's a video content type
    if (!contentType.startsWith('video/')) {
      return {
        success: false,
        error: 'Invalid content type. Expected video/*'
      };
    }

    // Validate content type matches fileType
    if (contentType !== fileType) {
      console.warn(`Content type mismatch: ${contentType} !== ${fileType}, using content type from data URI`);
    }

    console.log('Video validated, returning data URI for direct upload');

    // Return the data URI directly (no R2 upload)
    // The publish_post handler will upload directly to LinkedIn when creating the post
    return {
      success: true,
      videoUrl: video, // Return the data URI itself
      videoKey: filename, // Use filename as a reference
    };
  } catch (error: any) {
    console.error('Video validation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate video'
    };
  }
}
