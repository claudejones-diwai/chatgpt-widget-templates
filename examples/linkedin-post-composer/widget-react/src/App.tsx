import { useState, useEffect } from "react";
import { Send, X, ChevronUp, ChevronDown } from "lucide-react";
import { useTheme, useToolData, useServerAction, useOpenAiGlobal } from "./hooks";
import { AccountSelector } from "./components/AccountSelector";
import { PostPreview } from "./components/PostPreview";
import { Toolbar } from "./components/Toolbar";
import { Tooltip } from "./components/Tooltip";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { AddMediaModal } from "./components/AddMediaModal";
import { AddDocumentModal } from "./components/AddDocumentModal";
import { AIPromptModal } from "./components/AIPromptModal";
import { CarouselImageManager } from "./components/CarouselImageManager";
import type { ComposeLinkedInPostOutput, GenerateImageOutput, PublishPostOutput, UploadCarouselImagesOutput } from "../../shared-types";
import "react-tooltip/dist/react-tooltip.css";

export default function App() {
  const theme = useTheme();
  const displayMode = useOpenAiGlobal<"inline" | "fullscreen" | "picture-in-picture">("displayMode");
  const toolData = useToolData<ComposeLinkedInPostOutput>();

  // Local state
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [currentImage, setCurrentImage] = useState<{ source: 'upload' | 'ai-generate' | 'url'; url?: string; prompt?: string }>();
  const [carouselImages, setCarouselImages] = useState<{ url: string; order: number }[]>([]);
  const [currentDocument, setCurrentDocument] = useState<{ file: File; preview?: string } | null>(null);
  const [currentVideo, setCurrentVideo] = useState<{ file: File; preview?: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(true);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAIPromptModal, setShowAIPromptModal] = useState(false);
  const [mediaModalMode, setMediaModalMode] = useState<'replace' | 'append'>('replace');
  const [toast, setToast] = useState<{ type: 'info' | 'error'; message: string } | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);

  // Server actions
  const generateImage = useServerAction<{ prompt: string; style: string; size: string }, GenerateImageOutput>("generate_image");
  const uploadImage = useServerAction<{ image: string; filename: string }, { success: boolean; imageUrl?: string; error?: string }>("upload_image");
  const uploadCarouselImages = useServerAction<{ images: { image: string; filename: string; order: number }[] }, UploadCarouselImagesOutput>("upload_carousel_images");
  const uploadDocument = useServerAction<{ document: string; filename: string; fileType: string; fileSize: number }, { success: boolean; documentUrl?: string; error?: string }>("upload_document");
  const uploadVideo = useServerAction<{ video: string; filename: string; fileType: string; fileSize: number }, { success: boolean; videoUrl?: string; error?: string }>("upload_video");
  const publishPost = useServerAction<any, PublishPostOutput>("publish_post");

  // Initialize from tool data
  useEffect(() => {
    if (toolData) {
      setSelectedAccountId(toolData.selectedAccountId || toolData.accounts.personal.id);
      // Only set image if there's an actual URL (not just a suggested prompt)
      if (toolData.image?.url) {
        setCurrentImage(toolData.image);
      }
    }
  }, [toolData]);

  // Send conversational follow-up after successful publication
  useEffect(() => {
    if (publishPost.result?.success && typeof window !== 'undefined' && window.openai?.sendFollowUpMessage) {
      window.openai.sendFollowUpMessage({
        message: "Would you like me to help you with anything else? I can:\n- Create another LinkedIn post\n- Schedule a post for later\n- Generate engagement analytics\n- Suggest optimal posting times"
      });
    }
  }, [publishPost.result?.success]);

  // Handle image generation
  const handleGenerateImage = async (prompt: string) => {
    const result = await generateImage.execute({
      prompt,
      style: "professional",
      size: "1024x1024"
    });

    console.log('AI Generation result:', result);

    if (result.success && result.data?.imageUrl) {
      setCurrentImage({
        source: 'ai-generate',
        url: result.data.imageUrl,
        prompt
      });
    } else {
      // Show error to user
      const errorMessage = result.error || result.data?.error || 'Failed to generate image. Please try again.';
      setToast({ type: 'error', message: `AI Image Generation Failed: ${errorMessage}` });
      console.error('AI generation failed:', result);
    }
  };

  // Handle media upload (single image, carousel, or video)
  const handleMediaUpload = async (files: File[], mediaType: 'image' | 'carousel' | 'video') => {
    if (mediaType === 'video') {
      // Video upload - store File object, validation and upload happens on publish
      const file = files[0];

      // Clear any existing media and set video
      setCurrentImage(undefined);
      setCarouselImages([]);
      setCurrentDocument(null);
      setCurrentVideo({
        file: file,
        preview: URL.createObjectURL(file) // Create preview URL for video player
      });
      setShowAddMediaModal(false);
      return;
    }

    if (mediaType === 'image') {
      // Single image upload - always replaces existing media
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        // Clear any existing media and set new single image
        setCurrentImage({
          source: 'upload',
          url: reader.result as string,
        });
        setCarouselImages([]); // Clear carousel if exists
        setShowAddMediaModal(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    if (mediaType === 'carousel') {
      // Carousel images upload (2-20 images)

      // Determine starting order based on mode
      const startingOrder = mediaModalMode === 'append' ? carouselImages.length : 0;

      // Special case: Single image append uses upload_image action
      if (files.length === 1 && mediaModalMode === 'append') {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = async () => {
          const result = await uploadImage.execute({
            image: reader.result as string,
            filename: file.name
          });

          if (result.success && result.data?.imageUrl) {
            // Append single image to carousel
            setCarouselImages(prev => [...prev, {
              url: result.data!.imageUrl!,
              order: startingOrder
            }]);
            setShowAddMediaModal(false);
          } else {
            setToast({ type: 'error', message: 'Failed to upload image. Please try again.' });
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      const imageDataPromises = files.map(async (file, index) => {
        return new Promise<{ image: string; filename: string; order: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              image: reader.result as string,
              filename: file.name,
              order: startingOrder + index
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      try {
        const imageData = await Promise.all(imageDataPromises);

        // Upload to server
        const result = await uploadCarouselImages.execute({ images: imageData });

        if (result.success && result.data?.images) {
          const newImages = result.data.images;

          if (mediaModalMode === 'replace') {
            // Replace all media with new carousel
            setCurrentImage(undefined); // Clear single image if exists
            setCarouselImages(newImages);
          } else {
            // Append new images to existing carousel
            setCarouselImages(prev => [...prev, ...newImages]);
          }
          setShowAddMediaModal(false);
        } else {
          setToast({ type: 'error', message: 'Failed to upload images. Please try again.' });
        }
      } catch (error) {
        console.error('Failed to upload carousel images:', error);
        setToast({ type: 'error', message: 'Failed to upload images. Please try again.' });
      }
    }
  };

  // Toolbar handlers
  const handleGenerateAI = () => {
    setShowAIPromptModal(true);
  };

  const handleGenerateFromPrompt = async (prompt: string) => {
    await handleGenerateImage(prompt);
  };

  const handleAddMedia = () => {
    // Toolbar image icon - always replaces media
    setMediaModalMode('replace');
    setShowAddMediaModal(true);
  };

  const handleAddMoreToCarousel = () => {
    // Carousel "+ Add More" button - appends to carousel
    setMediaModalMode('append');
    setShowAddMediaModal(true);
  };

  const handleAddDocument = () => {
    setShowAddDocumentModal(true);
  };

  // Handle document upload (store File object, upload on publish)
  const handleDocumentUpload = async (file: File) => {
    // Clear any existing media and set document
    setCurrentImage(undefined);
    setCarouselImages([]);
    setCurrentDocument({
      file: file,
      preview: undefined // Could add preview generation here if needed
    });
    setShowAddDocumentModal(false);
  };

  const handleRemoveCarouselImage = (order: number) => {
    setCarouselImages(prev => {
      const remaining = prev.filter(img => img.order !== order);

      // If only 1 image remains, convert to single image and clear carousel
      if (remaining.length === 1) {
        setCurrentImage({
          source: 'upload',
          url: remaining[0].url
        });
        return []; // Clear carousel
      }

      return remaining;
    });
  };

  // Handle publish
  const handlePublish = async () => {
    if (!toolData) return;

    let postType: 'text' | 'image' | 'carousel' | 'document' | 'video' = 'text';
    let documentDataUri: string | undefined;
    let videoDataUri: string | undefined;

    if (currentVideo) {
      postType = 'video';

      // Read video file as base64 data URI
      const reader = new FileReader();
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(currentVideo.file);

      try {
        videoDataUri = await fileReadPromise;
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to read video file. Please try again.' });
        return;
      }
    } else if (currentDocument) {
      postType = 'document';

      // Read document file as base64 data URI
      const reader = new FileReader();
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(currentDocument.file);

      try {
        documentDataUri = await fileReadPromise;
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to read document file. Please try again.' });
        return;
      }
    } else if (carouselImages.length >= 2) {
      postType = 'carousel';
    } else if (currentImage) {
      postType = 'image';
    }

    await publishPost.execute({
      accountId: selectedAccountId,
      content: toolData.content,
      imageUrl: currentImage?.url,
      carouselImageUrls: carouselImages.map(img => img.url),
      documentUrl: documentDataUri, // Send data URI instead of R2 URL
      videoUrl: videoDataUri, // Send data URI instead of R2 URL
      postType
    });
  };

  // Get selected account for preview
  const selectedAccount = toolData?.accounts.personal.id === selectedAccountId
    ? toolData.accounts.personal
    : toolData?.accounts.organizations.find(org => org.id === selectedAccountId);

  const canPublish = toolData && toolData.content.trim().length > 0 && !publishPost.loading;

  // Determine container max-width based on display mode
  const containerMaxWidth = displayMode === "fullscreen"
    ? "max-w-4xl"
    : displayMode === "picture-in-picture"
    ? "max-w-sm"
    : "max-w-2xl"; // inline (default)

  // Loading state
  if (!toolData) {
    return (
      <div className={theme === "dark" ? "dark" : ""}>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-transparent">
        {/* Sticky All-in-One Header */}
        {!publishPost.result?.success && headerVisible && (
          <div className="sticky top-0 z-20 bg-surface">
            <div className={`${containerMaxWidth} mx-auto px-4 py-3`}>
              {/* Account Selector Row */}
              <div className="mb-3">
                <AccountSelector
                  accounts={toolData.accounts}
                  selectedAccountId={selectedAccountId}
                  onSelectAccount={setSelectedAccountId}
                />
              </div>

              {/* Toolbar + Publish Button Row */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Toolbar
                    onGenerateAI={handleGenerateAI}
                    onAddMedia={handleAddMedia}
                    onAddDocument={handleAddDocument}
                    disabled={publishPost.loading || generateImage.loading || uploadImage.loading || uploadCarouselImages.loading || uploadDocument.loading || uploadVideo.loading}
                    hasMedia={!!currentImage || carouselImages.length > 0 || !!currentDocument || !!currentVideo}
                    mediaType={
                      currentVideo ? 'video' :
                      currentDocument ? 'document' :
                      carouselImages.length >= 2 ? 'carousel' :
                      currentImage ? 'image' : null
                    }
                    imageSource={currentImage?.source || null}
                    isGeneratingAI={generateImage.loading}
                    isUploadingMedia={uploadImage.loading || uploadCarouselImages.loading}
                    isUploadingDocument={uploadDocument.loading}
                  />
                </div>

                <button
                  onClick={handlePublish}
                  disabled={!canPublish || publishPost.loading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm shrink-0"
                >
                  {publishPost.loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Separator with integrated chevron control */}
        {!publishPost.result?.success && (
          <div className="px-4 pt-4">
            <div className={`${containerMaxWidth} mx-auto`}>
              <div className="relative border-t border-border">
                <button
                  onClick={() => setHeaderVisible(!headerVisible)}
                  data-tooltip-id="collapse-tooltip"
                  data-tooltip-content={headerVisible ? "Collapse toolbar" : "Expand toolbar"}
                  className="absolute left-1/2 -translate-x-1/2 -top-4 rounded-full border border-border bg-surface shadow-sm p-1.5 text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
                  aria-label={headerVisible ? "Collapse toolbar" : "Expand toolbar"}
                >
                  {headerVisible ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Scrollable preview */}
        <div className="px-4 pt-4">
          <div className={`${containerMaxWidth} mx-auto`}>
            <div className="max-h-[80vh] overflow-y-auto pr-2">
              {/* LinkedIn Post Preview */}
              {!publishPost.result?.success && (
                <div>
                <PostPreview
                  accountName={selectedAccount?.name || "Your Account"}
                  content={toolData.content}
                  imageUrl={currentImage?.url}
                  carouselImages={carouselImages}
                  document={currentDocument}
                  video={currentVideo}
                  accountAvatarUrl={
                    'avatarUrl' in (selectedAccount || {})
                      ? (selectedAccount as any).avatarUrl
                      : 'logoUrl' in (selectedAccount || {})
                      ? (selectedAccount as any).logoUrl
                      : undefined
                  }
                  accountHeadline={
                    'headline' in (selectedAccount || {})
                      ? (selectedAccount as any).headline
                      : undefined
                  }
                  onRemoveImage={() => setCurrentImage(undefined)}
                  onRemoveDocument={() => setCurrentDocument(null)}
                  onRemoveVideo={() => setCurrentVideo(null)}
                  isGeneratingAI={generateImage.loading}
                  isUploadingMedia={uploadImage.loading || uploadCarouselImages.loading}
                  isUploadingDocument={uploadDocument.loading}
                />

                {/* Carousel Image Manager */}
                {carouselImages.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <CarouselImageManager
                      images={carouselImages}
                      onRemoveImage={handleRemoveCarouselImage}
                      onAddMore={handleAddMoreToCarousel}
                    />
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Notification - Drawer from top */}
        {publishPost.result?.success && showSuccessToast && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
            <div className={`relative bg-surface rounded-b-2xl shadow-2xl border-2 border-success ${containerMaxWidth} w-full max-h-[85vh] overflow-y-auto animate-slide-down`}>
              {/* Close button */}
              <button
                onClick={() => setShowSuccessToast(false)}
                className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-text-primary">
                      Published successfully!
                    </h3>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">
                      {publishPost.result.message}
                    </p>
                  </div>
                  {publishPost.result.postUrl && (
                    <a
                      href={publishPost.result.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-6 py-3 bg-success hover:bg-success-hover text-white rounded-xl transition-colors text-sm font-medium inline-flex items-center justify-center gap-2"
                    >
                      View Post on LinkedIn
                      <Send className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification - Drawer from top */}
        {publishPost.result && !publishPost.result.success && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
            <div className={`relative bg-surface rounded-b-2xl shadow-2xl border-2 border-error ${containerMaxWidth} w-full max-h-[85vh] overflow-y-auto animate-slide-down`}>
              {/* Close button */}
              <button
                onClick={() => publishPost.result = null}
                className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary">
                      Failed to publish
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {publishPost.result.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={showAddMediaModal}
        onClose={() => setShowAddMediaModal(false)}
        onUploadMedia={handleMediaUpload}
        isUploading={uploadCarouselImages.loading}
        mode={mediaModalMode}
      />

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={showAddDocumentModal}
        onClose={() => setShowAddDocumentModal(false)}
        onUploadDocument={handleDocumentUpload}
        isUploading={uploadDocument.loading}
      />

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={showAIPromptModal}
        onClose={() => setShowAIPromptModal(false)}
        onGenerate={handleGenerateFromPrompt}
        suggestedPrompt={toolData?.suggestedImagePrompt}
        isGenerating={generateImage.loading}
      />

      {/* Tooltip for collapse/expand control */}
      <Tooltip id="collapse-tooltip" place="top" closeOnClick={true} />

      {/* Toast Notification - Always at top */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 pointer-events-none max-w-md">
          <div className={`relative bg-surface rounded-xl shadow-2xl w-full p-4 space-y-2 pointer-events-auto border-2 ${
            toast.type === 'error' ? 'border-error' : 'border-primary'
          } animate-slide-down`}>
            {/* Close button */}
            <button
              onClick={() => setToast(null)}
              className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'error' ? 'bg-error' : 'bg-primary'
              }`}>
                {toast.type === 'error' ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1.5">
                <p className="text-sm text-text-primary whitespace-pre-wrap">
                  {toast.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
