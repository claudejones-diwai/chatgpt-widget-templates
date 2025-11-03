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
    // Parse base64 data URL
    // Format: data:image/png;base64,iVBORw0KGgoAAAANS...
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);

    if (!matches) {
      return {
        success: false,
        error: 'Invalid image data format. Expected base64 data URL.'
      };
    }

    const contentType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to R2
    const storage = new R2ImageStorage(env);
    const result = await storage.uploadImage({
      imageData: bytes,
      fileName: filename,
      contentType,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to upload image'
      };
    }

    return {
      success: true,
      imageUrl: result.publicUrl!,
      imageKey: result.key!,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process and upload image'
    };
  }
}
