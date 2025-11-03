import { ThumbsUp, MessageCircle, Repeat2, Send, Globe, X, Sparkles, Image as ImageIcon, FileText } from "lucide-react";
import { calculateMultiImageLayout } from "../utils/multiImageLayout";

interface CarouselImage {
  url: string;
  order: number;
}

interface PostPreviewProps {
  accountName: string;
  content: string;
  imageUrl?: string;
  carouselImages?: CarouselImage[];
  accountAvatarUrl?: string;
  accountHeadline?: string;
  onRemoveImage?: () => void;
}

export function PostPreview({
  accountName,
  content,
  imageUrl,
  carouselImages = [],
  accountAvatarUrl,
  accountHeadline,
  onRemoveImage,
}: PostPreviewProps) {
  const isEmpty = !content.trim() && !imageUrl && carouselImages.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isEmpty ? "Start typing to see preview" : "How it will look on LinkedIn"}
        </span>
      </div>

      {/* LinkedIn Post Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
        {/* Post Header */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {accountAvatarUrl ? (
              <img
                src={accountAvatarUrl}
                alt={`${accountName}'s profile`}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                {accountName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Account Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {accountName}
              </h3>
              {accountHeadline ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {accountHeadline}
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Product Manager at TechCorp AI
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
            {content ? (
              content
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="text-gray-400 dark:text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Start typing in the Edit tab to see your post preview
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Your content will update here in real-time
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Media Area - Shows image, carousel, or empty state */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {imageUrl ? (
            /* Single Image - Show with X overlay */
            <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 overflow-hidden relative group">
              <img
                src={imageUrl}
                alt="Post content"
                className="w-full h-full object-cover"
              />
              {/* Remove Image Button */}
              {onRemoveImage && (
                <button
                  onClick={onRemoveImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : carouselImages.length > 0 ? (
            /* Carousel Images - LinkedIn Layout */
            (() => {
              const sortedImages = [...carouselImages].sort((a, b) => a.order - b.order);
              const layout = calculateMultiImageLayout(sortedImages.length);
              const visibleImages = sortedImages.slice(0, layout.visibleCount);

              return (
                <div className="w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className={`grid ${layout.gridTemplate}`}>
                    {visibleImages.map((image, index) => (
                      <div
                        key={index}
                        className={`${layout.imageClasses[index]} relative overflow-hidden bg-gray-200 dark:bg-gray-700`}
                      >
                        <img
                          src={image.url}
                          alt={`Carousel image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Show "+N" overlay on last image if needed */}
                        {layout.showOverlay && index === visibleImages.length - 1 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">
                              +{layout.overlayCount}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Empty State - No Media */
            <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-16 px-6">
              <div className="max-w-md mx-auto text-center space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Enhance Your Post with Media
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the toolbar below to add visual content to your LinkedIn post
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-3 text-left bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Generate AI Image
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Click the sparkle icon to create professional images with AI
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ImageIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload Media
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Click the image icon to upload photos, videos, or create a carousel
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Add Document
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Click the document icon to upload PDFs, PowerPoint, or Word files
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                  Media is optional - you can publish without it
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Engagement Buttons */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 cursor-default">
              <ThumbsUp className="w-4 h-4" />
              Like
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 cursor-default">
              <MessageCircle className="w-4 h-4" />
              Comment
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 cursor-default">
              <Repeat2 className="w-4 h-4" />
              Repost
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 cursor-default">
              <Send className="w-4 h-4" />
              Send
            </div>
          </div>
        </div>
      </div>

      {!isEmpty && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          This is a preview. The actual post may look slightly different on LinkedIn.
        </p>
      )}
    </div>
  );
}
