import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { useTheme, useToolData, useServerAction } from "./hooks";
import { AccountSelector } from "./components/AccountSelector";
import { PostPreview } from "./components/PostPreview";
import { Toolbar } from "./components/Toolbar";
import { AddMediaModal } from "./components/AddMediaModal";
import { CarouselImageManager } from "./components/CarouselImageManager";
import type { ComposeLinkedInPostOutput, GenerateImageOutput, PublishPostOutput, UploadCarouselImagesOutput } from "../../shared-types";

export default function App() {
  const theme = useTheme();
  const toolData = useToolData<ComposeLinkedInPostOutput>();

  // Local state
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [currentImage, setCurrentImage] = useState<{ source: 'upload' | 'ai-generate' | 'url'; url?: string; prompt?: string }>();
  const [carouselImages, setCarouselImages] = useState<{ url: string; order: number }[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(true);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);

  // Server actions
  const generateImage = useServerAction<{ prompt: string; style: string; size: string }, GenerateImageOutput>("generate_image");
  const uploadCarouselImages = useServerAction<{ images: { image: string; filename: string; order: number }[] }, UploadCarouselImagesOutput>("upload_carousel_images");
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

  // Handle image generation
  const handleGenerateImage = async (prompt: string) => {
    const result = await generateImage.execute({
      prompt,
      style: "professional",
      size: "1024x1024"
    });

    if (result.success && result.data?.imageUrl) {
      setCurrentImage({
        source: 'ai-generate',
        url: result.data.imageUrl,
        prompt
      });
    }
  };

  // Handle media upload (single image, carousel, or video)
  const handleMediaUpload = async (files: File[], mediaType: 'image' | 'carousel' | 'video') => {
    if (mediaType === 'video') {
      // Phase 3.3: Video upload
      console.log('Video upload coming in Phase 3.3:', files[0]);
      alert('Video upload coming in Phase 3.3!');
      setShowAddMediaModal(false);
      return;
    }

    if (mediaType === 'image') {
      // Single image upload
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImage({
          source: 'upload',
          url: reader.result as string,
        });
        setShowAddMediaModal(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    if (mediaType === 'carousel') {
      // Carousel images upload (2-20 images)
      const imageDataPromises = files.map(async (file, index) => {
        return new Promise<{ image: string; filename: string; order: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              image: reader.result as string,
              filename: file.name,
              order: index
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
          setCarouselImages(result.data.images);
          setShowAddMediaModal(false);
        }
      } catch (error) {
        console.error('Failed to upload carousel images:', error);
      }
    }
  };

  // Toolbar handlers
  const handleGenerateAI = async () => {
    if (!toolData) return;

    // Use ChatGPT's suggested image prompt if available
    const prompt = toolData.suggestedImagePrompt ||
      window.prompt(
        'Enter a description for the AI image generation:',
        'Professional workspace with modern design elements'
      );

    if (prompt && prompt.trim().length >= 10) {
      await handleGenerateImage(prompt.trim());
    } else if (prompt) {
      alert('Please enter at least 10 characters for the image prompt');
    }
  };

  const handleAddMedia = () => {
    setShowAddMediaModal(true);
  };

  const handleAddDocument = () => {
    // Phase 3.2: Document upload
    alert('Document upload coming in Phase 3.2!');
  };

  const handleRemoveCarouselImage = (index: number) => {
    setCarouselImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle publish
  const handlePublish = async () => {
    if (!toolData) return;

    let postType: 'text' | 'image' | 'carousel' = 'text';

    if (carouselImages.length >= 2) {
      postType = 'carousel';
    } else if (currentImage) {
      postType = 'image';
    }

    await publishPost.execute({
      accountId: selectedAccountId,
      content: toolData.content,
      imageUrl: currentImage?.url,
      carouselImageUrls: carouselImages.map(img => img.url),
      postType
    });
  };

  // Get selected account for preview
  const selectedAccount = toolData?.accounts.personal.id === selectedAccountId
    ? toolData.accounts.personal
    : toolData?.accounts.organizations.find(org => org.id === selectedAccountId);

  const canPublish = toolData && toolData.content.trim().length > 0 && !publishPost.loading;

  // Loading state
  if (!toolData) {
    return (
      <div className={theme === "dark" ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading LinkedIn Post Composer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-2xl mx-auto p-6 space-y-4">
          {/* Main Publishing Card */}
          {!publishPost.result?.success && (
            <div className="space-y-4">
              {/* Account Selection - Moved to top */}
              <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
                <AccountSelector
                  accounts={toolData.accounts}
                  selectedAccountId={selectedAccountId}
                  onSelectAccount={setSelectedAccountId}
                />
              </div>

              {/* Content Editor with Toolbar */}
              <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                {/* LinkedIn Post Preview */}
                <PostPreview
                  accountName={selectedAccount?.name || "Your Account"}
                  content={toolData.content}
                  imageUrl={currentImage?.url}
                  carouselImages={carouselImages}
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
                />

                {/* Carousel Image Manager */}
                {carouselImages.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <CarouselImageManager
                      images={carouselImages}
                      onRemoveImage={handleRemoveCarouselImage}
                    />
                  </div>
                )}

                {/* Toolbar */}
                <Toolbar
                  onGenerateAI={handleGenerateAI}
                  onAddMedia={handleAddMedia}
                  onAddDocument={handleAddDocument}
                  disabled={publishPost.loading}
                  hasMedia={!!currentImage || carouselImages.length > 0}
                  mediaType={
                    carouselImages.length >= 2 ? 'carousel' :
                    currentImage ? 'image' : null
                  }
                />
              </div>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={!canPublish || publishPost.loading}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
              >
                {publishPost.loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing to LinkedIn...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Publish to LinkedIn
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success Toast Notification - Fixed at bottom */}
          {publishPost.result?.success && showSuccessToast && (
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pb-6 pointer-events-none">
              <div className="relative bg-surface rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 pointer-events-auto border-2 border-success animate-slide-up">
                {/* Close button */}
                <button
                  onClick={() => setShowSuccessToast(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                  aria-label="Close notification"
                >
                  <X className="w-5 h-5" />
                </button>
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
          )}

          {/* Error Message */}
          {publishPost.result && !publishPost.result.success && (
            <div className="p-4 bg-error-surface border border-error rounded-xl">
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
          )}
        </div>

        {/* Add Media Modal */}
        <AddMediaModal
          isOpen={showAddMediaModal}
          onClose={() => setShowAddMediaModal(false)}
          onUploadMedia={handleMediaUpload}
          isUploading={uploadCarouselImages.loading}
        />
      </div>
    </div>
  );
}
