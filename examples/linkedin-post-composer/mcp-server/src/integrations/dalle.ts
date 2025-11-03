// DALL-E 3 Image Generation Integration
// Generates images using OpenAI's DALL-E 3 API

import { Env } from '../index';

export interface DalleGenerateImageArgs {
  prompt: string;
  style?: 'natural' | 'vivid';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
}

export interface DalleGenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  revisedPrompt?: string;
  error?: string;
}

interface OpenAIImageResponse {
  created: number;
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export class DalleImageGenerator {
  constructor(private env: Env) {}

  /**
   * Generate an image using DALL-E 3
   * @param args - Image generation parameters
   * @returns Image URL and revised prompt
   */
  async generateImage(args: DalleGenerateImageArgs): Promise<DalleGenerateImageResponse> {
    // Validate API key
    if (!this.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY secret.',
      };
    }

    // Validate prompt
    if (!args.prompt || args.prompt.trim().length === 0) {
      return {
        success: false,
        error: 'Image prompt is required',
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: args.prompt,
          n: 1, // DALL-E 3 only supports n=1
          size: args.size || '1024x1024',
          quality: args.quality || 'standard',
          style: args.style || 'natural',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as OpenAIErrorResponse;

        // Handle specific error types
        if (response.status === 401) {
          return {
            success: false,
            error: 'Invalid OpenAI API key. Please check your configuration.',
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            error: 'Rate limit exceeded. Please try again in a moment.',
          };
        }

        if (errorData.error?.code === 'content_policy_violation') {
          return {
            success: false,
            error: 'Image prompt violates content policy. Please try a different prompt.',
          };
        }

        return {
          success: false,
          error: errorData.error?.message || `Image generation failed: ${response.statusText}`,
        };
      }

      const data = await response.json() as OpenAIImageResponse;

      if (!data.data || data.data.length === 0) {
        return {
          success: false,
          error: 'No image data returned from API',
        };
      }

      return {
        success: true,
        imageUrl: data.data[0].url, // Temporary URL (expires in 1 hour)
        revisedPrompt: data.data[0].revised_prompt,
      };
    } catch (error: any) {
      console.error('DALL-E generation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate image. Please try again.',
      };
    }
  }
}
