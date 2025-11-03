import { Sparkles, Image, FileText, Clock, Loader2 } from "lucide-react";
import { Tooltip } from "./Tooltip";

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

  // Dynamic tooltip content
  const generateAITooltip = isGeneratingAI
    ? "Generating image..."
    : imageSource === 'ai-generate'
      ? "Regenerate AI image with different prompt"
      : hasMedia
        ? "Remove media to generate AI image"
        : "Generate an image using AI (DALL-E)";

  const addMediaTooltip = isUploadingMedia
    ? "Uploading media..."
    : mediaType === 'carousel'
      ? "Manage carousel images (2-20 images)"
      : "Upload images for carousel (2-20) or single video";

  const addDocumentTooltip = hasMedia
    ? "Remove media to add document"
    : "Upload a document (PDF, PowerPoint, Word)";

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center justify-between">
        {/* Left: Media Actions */}
        <div className="flex items-center gap-2">
          {/* Generate AI Image */}
          <button
            onClick={onGenerateAI}
            disabled={!canGenerateAI}
            data-tooltip-id="toolbar-tooltip"
            data-tooltip-content={generateAITooltip}
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
            data-tooltip-id="toolbar-tooltip"
            data-tooltip-content={addMediaTooltip}
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
            data-tooltip-id="toolbar-tooltip"
            data-tooltip-content={addDocumentTooltip}
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
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Schedule (Future Phase) */}
        {onSchedule && (
          <button
            onClick={onSchedule}
            disabled={disabled}
            data-tooltip-id="toolbar-tooltip"
            data-tooltip-content="Schedule for later"
            className={`
              p-2.5 rounded-lg transition-colors
              ${disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Schedule post"
          >
            <Clock className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tooltip Component */}
      <Tooltip id="toolbar-tooltip" place="top" />
    </div>
  );
}
