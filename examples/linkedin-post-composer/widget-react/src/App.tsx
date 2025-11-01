import { useState, useEffect } from "react";
import { X, Edit3, Eye } from "lucide-react";
import { useTheme, useToolData, useServerAction } from "./hooks";
import { AccountSelector } from "./components/AccountSelector";
import { ContentEditor } from "./components/ContentEditor";
import { ImageSection } from "./components/ImageSection";
import { PostPreview } from "./components/PostPreview";
import { ActionButtons } from "./components/ActionButtons";
import type { ComposeLinkedInPostOutput, GenerateImageOutput, PublishPostOutput } from "../../shared-types";

type ViewMode = 'edit' | 'preview';

export default function App() {
  const theme = useTheme();
  const toolData = useToolData<ComposeLinkedInPostOutput>();

  // Local state
  const [content, setContent] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [currentImage, setCurrentImage] = useState<{ source: 'upload' | 'ai-generate' | 'url'; url?: string; prompt?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Server actions
  const generateImage = useServerAction<{ prompt: string; style: string; size: string }, GenerateImageOutput>("generate_image");
  const publishPost = useServerAction<any, PublishPostOutput>("publish_post");

  // Initialize from tool data
  useEffect(() => {
    if (toolData) {
      setContent(toolData.content || "");
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

  // Handle image upload
  const handleUploadImage = (_file: File, dataUrl: string) => {
    // For Phase 1, use the data URL directly for preview
    // In Phase 2, we'll call the upload_image server action with the file
    setCurrentImage({
      source: 'upload',
      url: dataUrl,
    });
  };

  // Handle publish
  const handlePublish = async () => {
    if (!toolData) return;

    const postType = currentImage ? 'image' : 'text';

    await publishPost.execute({
      accountId: selectedAccountId,
      content,
      imageUrl: currentImage?.url,
      postType
    });
  };

  // Get selected account for preview
  const selectedAccount = toolData?.accounts.personal.id === selectedAccountId
    ? toolData.accounts.personal
    : toolData?.accounts.organizations.find(org => org.id === selectedAccountId);

  const canPublish = content.trim().length > 0 && content.length <= 3000 && !publishPost.loading;
  const hasContent = content.trim().length > 0 || currentImage;

  // Handle close with confirmation
  const handleClose = () => {
    if (hasContent && !publishPost.result?.success) {
      setShowCloseConfirm(true);
    } else {
      window.close();
    }
  };

  const confirmClose = () => {
    window.close();
  };

  // Loading state
  if (!toolData) {
    return (
      <div className={theme === "dark" ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-linkedin-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading LinkedIn Post Composer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header with Close Button */}
          <div className="relative">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                LinkedIn Post Composer
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, preview, and publish your LinkedIn post
              </p>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 rounded-full transition-all shadow-sm hover:shadow-md"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Close Confirmation Modal */}
          {showCloseConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Close without publishing?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your post hasn't been published yet. If you close now, your changes will be lost.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCloseConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={confirmClose}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Close Anyway
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-t-xl border border-gray-200 dark:border-gray-700 border-b-0">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'edit'
                    ? 'text-linkedin-600 dark:text-linkedin-400 border-b-2 border-linkedin-600 dark:border-linkedin-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'preview'
                    ? 'text-linkedin-600 dark:text-linkedin-400 border-b-2 border-linkedin-600 dark:border-linkedin-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>

          {/* Edit View */}
          {viewMode === 'edit' && (
            <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-0 p-6 space-y-6">
              {/* Account Selection */}
              <AccountSelector
                accounts={toolData.accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={setSelectedAccountId}
              />

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Content Editor */}
              <ContentEditor
                content={content}
                onContentChange={setContent}
              />

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Image Section */}
              {toolData.phase1Features.allowAiGeneration && (
                <ImageSection
                  image={currentImage}
                  postType={toolData.postType}
                  suggestedPrompt={toolData.suggestedImagePrompt}
                  onGenerateImage={handleGenerateImage}
                  onUploadImage={handleUploadImage}
                  onRemoveImage={() => setCurrentImage(undefined)}
                  isGenerating={generateImage.loading}
                />
              )}
            </div>
          )}

          {/* Preview View */}
          {viewMode === 'preview' && (
            <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-0 p-6">
              <PostPreview
                accountName={selectedAccount?.name || "Your Account"}
                content={content}
                imageUrl={currentImage?.url}
              />
            </div>
          )}

          {/* Action Buttons */}
          <ActionButtons
            onPublish={handlePublish}
            isPublishing={publishPost.loading}
            canPublish={canPublish}
            publishResult={publishPost.result || undefined}
          />

          {/* Phase 1 Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Phase 1 Notice:</strong> Using mock data. See{" "}
              <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                PRD.md
              </code>{" "}
              for real API integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
