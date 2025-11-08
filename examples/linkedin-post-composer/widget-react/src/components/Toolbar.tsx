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
  isUploadingDocument?: boolean;
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
  isUploadingMedia = false,
  isUploadingDocument = false
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
    : "Upload media for your post";

  const addDocumentTooltip = isUploadingDocument
    ? "Uploading document..."
    : hasMedia
      ? "Remove media to add document"
      : "Upload a document (PDF, PowerPoint, Word)";

  return (
    <div>
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
              p-3 rounded-lg transition-colors
              ${!canGenerateAI
                ? 'text-text-tertiary cursor-not-allowed'
                : imageSource === 'ai-generate'
                  ? 'text-accent-blue bg-accent-blue/10'
                  : 'text-text-secondary hover:bg-surface-secondary'
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
              p-3 rounded-lg transition-colors
              ${disabled || isUploadingMedia
                ? 'text-text-tertiary cursor-not-allowed'
                : mediaType === 'carousel' || mediaType === 'video'
                  ? 'text-accent-blue bg-accent-blue/10'
                  : 'text-text-secondary hover:bg-surface-secondary'
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
            disabled={disabled || hasMedia || isUploadingDocument}
            data-tooltip-id="toolbar-tooltip"
            data-tooltip-content={addDocumentTooltip}
            className={`
              p-3 rounded-lg transition-colors
              ${hasMedia || disabled || isUploadingDocument
                ? 'text-text-tertiary cursor-not-allowed'
                : mediaType === 'document'
                  ? 'text-accent-blue bg-accent-blue/10'
                  : 'text-text-secondary hover:bg-surface-secondary'
              }
            `}
            aria-label="Add document"
          >
            {isUploadingDocument ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
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
              p-3 rounded-lg transition-colors
              ${disabled
                ? 'text-text-tertiary cursor-not-allowed'
                : 'text-text-secondary hover:bg-surface-secondary'
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
