import { Sparkles, Image, FileText, Clock, Loader2 } from "lucide-react";

export interface ToolbarProps {
  onGenerateAI: () => void;
  onAddMedia: () => void;
  onAddDocument: () => void;
  onSchedule?: () => void;
  disabled?: boolean;
  hasMedia?: boolean;
  mediaType?: 'image' | 'carousel' | 'video' | 'document' | null;
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
  isGeneratingAI = false,
  isUploadingMedia = false
}: ToolbarProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center justify-between">
        {/* Left: Media Actions */}
        <div className="flex items-center gap-2">
          {/* Generate AI Image */}
          <button
            onClick={onGenerateAI}
            disabled={disabled || hasMedia || isGeneratingAI}
            className={`
              p-2.5 rounded-lg transition-colors
              ${hasMedia || disabled || isGeneratingAI
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Generate AI image"
            title={
              isGeneratingAI ? "Generating image..." :
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
            {mediaType === 'image' && 'Single image added. Remove to add carousel, video, or generate with AI.'}
            {mediaType === 'carousel' && 'Carousel added. Click the image icon to add more images (up to 20 total).'}
            {mediaType === 'video' && 'Video added. Remove to add images, document, or generate with AI.'}
            {mediaType === 'document' && 'Document added. Remove to add other media or generate with AI.'}
          </p>
          {(mediaType === 'image' || mediaType === 'video' || mediaType === 'document') && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              • The sparkle icon (Generate AI) is disabled while media is attached. Remove media to use AI generation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
