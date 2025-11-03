import type { GenerateImageOutput } from '../../../shared-types';
import { DalleImageGenerator } from '../integrations/dalle';
import { R2ImageStorage } from '../integrations/r2-storage';
import type { Env } from '../index';

export interface GenerateImageParams {
  prompt: string;
  style?: 'professional' | 'creative' | 'minimalist';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
}

export async function handleGenerateImage(params: GenerateImageParams, env: Env): Promise<GenerateImageOutput> {
  const { prompt, style = 'professional', size = '1024x1024' } = params;

  // Validate prompt
  if (!prompt || prompt.length < 10) {
    return {
      success: false,
      error: 'Image prompt must be at least 10 characters'
    };
  }

  if (prompt.length > 500) {
    return {
      success: false,
      error: 'Image prompt must be 500 characters or less'
    };
  }

  // Map style to DALL-E style parameter
  // professional/minimalist → natural, creative → vivid
  const dalleStyle = style === 'creative' ? 'vivid' : 'natural';

  // Step 1: Generate image using DALL-E 3
  const generator = new DalleImageGenerator(env);
  const result = await generator.generateImage({
    prompt,
    style: dalleStyle,
    size,
    quality: 'standard', // Use standard quality to keep costs down
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to generate image'
    };
  }

  // Step 2: Download DALL-E image and upload to R2 for permanent storage
  // DALL-E URLs expire in 1-2 hours, so we need to save them immediately
  const storage = new R2ImageStorage(env);
  const fileName = `dalle-${Date.now()}.png`;
  const uploadResult = await storage.downloadAndUpload(result.imageUrl!, fileName);

  if (!uploadResult.success) {
    // If R2 upload fails, return the temporary DALL-E URL anyway
    // (better than failing completely)
    console.warn('R2 upload failed, using temporary DALL-E URL:', uploadResult.error);
    return {
      success: true,
      imageUrl: result.imageUrl!,
      imageKey: fileName,
      revisedPrompt: result.revisedPrompt,
    };
  }

  // Return permanent R2 URL
  return {
    success: true,
    imageUrl: uploadResult.publicUrl!,
    imageKey: uploadResult.key!,
    revisedPrompt: result.revisedPrompt,
  };
}
