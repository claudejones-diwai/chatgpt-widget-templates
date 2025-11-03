import { Sparkles, Image, FileText, Clock, Loader2 } from "lucide-react";

export interface ToolbarProps {
  onGenerateAI: () => void;
  onAddMedia: () => void;
  onAddDocument: () => void;
  onSchedule?: () => void;
  disabled?: boolean;
  hasMedia?: boolean;
  mediaType?: 'image' | 'carousel' | 'video' | 'document' | null;
  imageSource?: 'upload' | 'ai-generate' | 'url' | null;
  isGeneratingAI?: boolean;
  isUploadingMedia?: boolean;
}

export function Toolbar({
  onGenerateAI,
  onAddMedia,
  onAddDocument,
  onSchedule,
  disabled = false,
  hasMedia = false,
  mediaType = null,
  imageSource = null,
  isGeneratingAI = false,
  isUploadingMedia = false
}: ToolbarProps) {
  // Allow AI regeneration if current image is AI-generated
  const canGenerateAI = !disabled && !isGeneratingAI && (imageSource === 'ai-generate' || !hasMedia);
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center justify-between">
        {/* Left: Media Actions */}
        <div className="flex items-center gap-2">
          {/* Generate AI Image */}
          <button
            onClick={onGenerateAI}
            disabled={!canGenerateAI}
            className={`
              p-2.5 rounded-lg transition-colors
              ${!canGenerateAI
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : imageSource === 'ai-generate'
                  ? 'text-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Generate AI image"
            title={
              isGeneratingAI ? "Generating image..." :
              imageSource === 'ai-generate' ? "Regenerate AI image with different prompt" :
              hasMedia ? "Remove media to generate AI image" :
              "Generate an image using AI (DALL-E)"
            }
          >
            {isGeneratingAI ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </button>

          {/* Add Media (Images or Video) */}
          <button
            onClick={onAddMedia}
            disabled={disabled || isUploadingMedia}
            className={`
              p-2.5 rounded-lg transition-colors
              ${disabled || isUploadingMedia
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : mediaType === 'carousel' || mediaType === 'video'
                  ? 'text-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Add media"
            title={
              isUploadingMedia ? "Uploading media..." :
              mediaType === 'carousel' ? "Manage carousel images (2-20 images)" :
              "Upload images for carousel (2-20) or single video"
            }
          >
            {isUploadingMedia ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Image className="w-5 h-5" />
            )}
          </button>

          {/* Add Document */}
          <button
            onClick={onAddDocument}
            disabled={disabled || hasMedia}
            className={`
              p-2.5 rounded-lg transition-colors
              ${hasMedia || disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : mediaType === 'document'
                  ? 'text-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Add document"
            title={hasMedia ? "Remove media to add document" : "Upload a document (PDF, PowerPoint, Word)"}
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Schedule (Future Phase) */}
        {onSchedule && (
          <button
            onClick={onSchedule}
            disabled={disabled}
            className={`
              p-2.5 rounded-lg transition-colors
              ${disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Schedule post"
            title="Schedule for later"
          >
            <Clock className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Helper Text */}
      {hasMedia && mediaType && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {mediaType === 'image' && imageSource === 'ai-generate' && 'AI-generated image. Click the sparkle icon to regenerate with a new prompt.'}
            {mediaType === 'image' && imageSource !== 'ai-generate' && 'Single image added. The image icon will replace this image.'}
            {mediaType === 'carousel' && 'Carousel added. Use "+ Add More Images" below to add more (up to 20 total).'}
            {mediaType === 'video' && 'Video added. The image icon will replace this video.'}
            {mediaType === 'document' && 'Document added. The image icon will replace this document.'}
          </p>
          {(mediaType === 'image' || mediaType === 'video' || mediaType === 'document') && imageSource !== 'ai-generate' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              • The sparkle icon (Generate AI) is disabled while media is attached. Remove media to use AI generation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
