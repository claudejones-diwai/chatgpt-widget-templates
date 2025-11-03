import { Sparkles, Image, FileText, Clock } from "lucide-react";

export interface ToolbarProps {
  onGenerateAI: () => void;
  onAddMedia: () => void;
  onAddDocument: () => void;
  onSchedule?: () => void;
  disabled?: boolean;
  hasMedia?: boolean;
  mediaType?: 'image' | 'carousel' | 'video' | 'document' | null;
}

export function Toolbar({
  onGenerateAI,
  onAddMedia,
  onAddDocument,
  onSchedule,
  disabled = false,
  hasMedia = false,
  mediaType = null
}: ToolbarProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center justify-between">
        {/* Left: Media Actions */}
        <div className="flex items-center gap-2">
          {/* Generate AI Image */}
          <button
            onClick={onGenerateAI}
            disabled={disabled || hasMedia}
            className={`
              p-2.5 rounded-lg transition-colors
              ${hasMedia || disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Generate AI image"
            title="Generate image with AI"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Add Media (Images or Video) */}
          <button
            onClick={onAddMedia}
            disabled={disabled}
            className={`
              p-2.5 rounded-lg transition-colors
              ${disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : mediaType === 'carousel' || mediaType === 'video'
                  ? 'text-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            aria-label="Add media"
            title="Upload images or video"
          >
            <Image className="w-5 h-5" />
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
            title="Upload document (PDF, DOC, PPT)"
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {mediaType === 'image' && 'Single image added. Remove to add carousel or video.'}
          {mediaType === 'carousel' && 'Carousel added. Click "Add Media" to manage images.'}
          {mediaType === 'video' && 'Video added. Remove to add images or document.'}
          {mediaType === 'document' && 'Document added. Remove to add other media.'}
        </p>
      )}
    </div>
  );
}
