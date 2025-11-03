import { ThumbsUp, MessageCircle, Repeat2, Send, Globe, X, Upload, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { validateFile, readFileAsDataURL } from "../utils/fileValidation";
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
  // Image controls
  postType?: 'text' | 'image' | 'carousel' | 'video' | 'document' | 'poll';
  suggestedPrompt?: string;
  onGenerateImage?: (prompt: string) => void;
  onUploadImage?: (file: File, dataUrl: string) => void;
  isGenerating?: boolean;
  allowImageControls?: boolean;
}

export function PostPreview({
  accountName,
  content,
  imageUrl,
  carouselImages = [],
  accountAvatarUrl,
  accountHeadline,
  onRemoveImage,
  postType = 'text',
  suggestedPrompt,
  onGenerateImage,
  onUploadImage,
  isGenerating = false,
  allowImageControls = false,
}: PostPreviewProps) {
  const isEmpty = !content.trim() && !imageUrl && carouselImages.length === 0;

  // Image control state
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [imagePrompt, setImagePrompt] = useState(suggestedPrompt || "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update image prompt when suggested prompt changes
  useEffect(() => {
    if (suggestedPrompt) {
      setImagePrompt(suggestedPrompt);
    }
  }, [suggestedPrompt]);

  // Close prompt editor when generation completes
  useEffect(() => {
    if (!isGenerating && showPromptEditor && imageUrl) {
      setShowPromptEditor(false);
    }
  }, [isGenerating, showPromptEditor, imageUrl]);

  // Keyboard shortcut: Escape to close prompt editor
  useEffect(() => {
    if (!showPromptEditor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPromptEditor) {
        e.preventDefault();
        setShowPromptEditor(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPromptEditor]);

  const handleGenerate = () => {
    if (imagePrompt.trim().length >= 10 && onGenerateImage) {
      onGenerateImage(imagePrompt.trim());
    }
  };

  const handleUploadClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadImage) return;

    setUploadError(null);
    setIsUploadingFile(true);

    // Validate file
    const validation = validateFile(file, postType);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      setIsUploadingFile(false);
      return;
    }

    try {
      // Read file as data URL for immediate preview
      const dataUrl = await readFileAsDataURL(file);
      onUploadImage(file, dataUrl);
    } catch (error) {
      setUploadError("Failed to read file. Please try again.");
    } finally {
      setIsUploadingFile(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

        {/* Media Area - Shows image, carousel, OR controls */}
        {(imageUrl || carouselImages.length > 0 || allowImageControls) && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Single Image - Show with X overlay */}
            {imageUrl && !showPromptEditor ? (
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
            ) : allowImageControls && !showPromptEditor ? (
              /* No Image - Show Upload/Generate Controls */
              <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
                {/* Upload Error */}
                {uploadError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                    <div className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">⚠️</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-red-900 dark:text-red-100">{uploadError}</p>
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="text-red-600 dark:text-red-400 hover:opacity-70 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={handleUploadClick}
                    disabled={isGenerating || isUploadingFile}
                    aria-label="Upload image from device"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    Upload Image
                  </button>
                  <button
                    onClick={() => setShowPromptEditor(true)}
                    disabled={isGenerating || isUploadingFile}
                    aria-label="Generate image using AI"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    Generate with AI
                  </button>
                </div>
                {(isGenerating || isUploadingFile) && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">{isUploadingFile ? 'Uploading image...' : 'Generating image...'}</span>
                  </div>
                )}
              </div>
            ) : showPromptEditor ? (
              /* Prompt Editor */
              <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Describe the image you want to generate
                </label>

                <TextareaAutosize
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Professional tech workspace with AI elements, modern design, blue and orange color scheme..."
                  minRows={3}
                  maxRows={6}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-gray-100"
                />
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{imagePrompt.length} / 500 characters</span>
                  {imagePrompt.length < 10 && (
                    <span className="text-red-600 dark:text-red-400">
                      Minimum 10 characters
                    </span>
                  )}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowPromptEditor(false)}
                    className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={imagePrompt.trim().length < 10 || isGenerating}
                    className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Engagement Buttons */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ThumbsUp className="w-4 h-4" />
              Like
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Repeat2 className="w-4 h-4" />
              Repost
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Send className="w-4 h-4" />
              Send
            </button>
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
