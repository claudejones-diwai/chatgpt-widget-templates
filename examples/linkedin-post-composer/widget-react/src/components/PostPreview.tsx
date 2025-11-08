import { useState } from "react";
import { ThumbsUp, MessageCircle, Repeat2, Send, Globe, X, Image as ImageIcon, FileText } from "lucide-react";
import { calculateMultiImageLayout } from "../utils/multiImageLayout";
import { Skeleton } from "./Skeleton";

interface CarouselImage {
  url: string;
  order: number;
}

interface DocumentPreview {
  file: File;
  preview?: string;
}

interface VideoPreview {
  file: File;
  preview?: string;
}

interface PostPreviewProps {
  accountName: string;
  content: string;
  imageUrl?: string;
  carouselImages?: CarouselImage[];
  document?: DocumentPreview | null;
  video?: VideoPreview | null;
  accountAvatarUrl?: string;
  accountHeadline?: string;
  onRemoveImage?: () => void;
  onRemoveDocument?: () => void;
  onRemoveVideo?: () => void;
  isGeneratingAI?: boolean;
  isUploadingMedia?: boolean;
  isUploadingDocument?: boolean;
}

// Image component with loading skeleton
function ImageWithSkeleton({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-surface-tertiary animate-skeleton-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  );
}

export function PostPreview({
  accountName,
  content,
  imageUrl,
  carouselImages = [],
  document,
  video,
  accountAvatarUrl,
  accountHeadline,
  onRemoveImage,
  onRemoveDocument,
  onRemoveVideo,
  isGeneratingAI = false,
  isUploadingMedia = false,
  isUploadingDocument = false,
}: PostPreviewProps) {
  const isLoading = isGeneratingAI || isUploadingMedia || isUploadingDocument;
  return (
    <div>
      {/* LinkedIn Post Card */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
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
              <div className="text-center py-12">
                <div className="text-text-tertiary">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary">
                  Your post content will appear here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Media Area - Shows video, image, carousel, document, or empty state */}
        <div className="border-t border-gray-200 dark:border-gray-700 flex-1 flex flex-col">
          {video ? (
            /* Video Preview */
            <div className="w-full bg-gray-900 relative group">
              <video
                src={video.preview}
                controls
                className="w-full max-h-[500px] object-contain"
                preload="metadata"
              />
              {/* Remove Video Button */}
              {onRemoveVideo && (
                <button
                  onClick={onRemoveVideo}
                  className="absolute top-3 right-3 min-w-[44px] min-h-[44px] bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove video"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : document ? (
            /* Document Preview */
            <div className="w-full bg-gray-50 dark:bg-gray-800 p-6 relative group">
              <div className="max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    {/* Document Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      document.file.type === 'application/pdf' ? 'bg-red-500' :
                      document.file.type.includes('word') ? 'bg-blue-500' :
                      document.file.type.includes('presentation') || document.file.type.includes('powerpoint') ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {document.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {document.file.type === 'application/pdf' ? 'PDF Document' :
                         document.file.type.includes('word') ? 'Word Document' :
                         document.file.type.includes('presentation') || document.file.type.includes('powerpoint') ? 'PowerPoint Presentation' :
                         'Document'} • {(document.file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove Document Button */}
              {onRemoveDocument && (
                <button
                  onClick={onRemoveDocument}
                  className="absolute top-3 right-3 min-w-[44px] min-h-[44px] bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove document"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : imageUrl ? (
            /* Single Image - Show with X overlay */
            <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 overflow-hidden relative group">
              <ImageWithSkeleton
                src={imageUrl}
                alt="Post content"
                className="w-full h-full object-cover"
              />
              {/* Remove Image Button */}
              {onRemoveImage && (
                <button
                  onClick={onRemoveImage}
                  className="absolute top-3 right-3 min-w-[44px] min-h-[44px] bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
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
                        <ImageWithSkeleton
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
          ) : isLoading ? (
            /* Loading State - Skeleton */
            <div className="w-full h-96 bg-surface-secondary relative">
              <Skeleton variant="rectangular" height="100%" width="100%" animation="wave" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-text-secondary">
                    {isGeneratingAI ? 'Generating AI image...' : isUploadingDocument ? 'Uploading document...' : 'Uploading media...'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State - No Media */
            <div className="flex-1 w-full bg-surface-secondary px-6 py-20 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-text-tertiary">
                  <ImageIcon className="w-12 h-12 mx-auto opacity-40" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-text-secondary">
                  Add media using the toolbar above
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
    </div>
  );
}
