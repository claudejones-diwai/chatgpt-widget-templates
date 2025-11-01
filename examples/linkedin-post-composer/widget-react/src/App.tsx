import { useState, useEffect } from "react";
import { useTheme, useToolData, useServerAction } from "./hooks";
import { AccountSelector } from "./components/AccountSelector";
import { ContentEditor } from "./components/ContentEditor";
import { ImageSection } from "./components/ImageSection";
import { PostPreview } from "./components/PostPreview";
import { ActionButtons } from "./components/ActionButtons";
import type { ComposeLinkedInPostOutput, GenerateImageOutput, PublishPostOutput } from "../../shared-types";

export default function App() {
  const theme = useTheme();
  const toolData = useToolData<ComposeLinkedInPostOutput>();

  // Local state
  const [content, setContent] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [currentImage, setCurrentImage] = useState<{ source: 'upload' | 'ai-generate' | 'url'; url?: string; prompt?: string }>();

  // Server actions
  const generateImage = useServerAction<{ prompt: string; style: string; size: string }, GenerateImageOutput>("generate_image");
  const publishPost = useServerAction<any, PublishPostOutput>("publish_post");

  // Initialize from tool data
  useEffect(() => {
    if (toolData) {
      setContent(toolData.content || "");
      setSelectedAccountId(toolData.selectedAccountId || toolData.accounts.personal.id);
      if (toolData.image) {
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
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              LinkedIn Post Composer
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create, preview, and publish your LinkedIn post
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
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
                onGenerateImage={handleGenerateImage}
                onRemoveImage={() => setCurrentImage(undefined)}
                isGenerating={generateImage.loading}
              />
            )}
          </div>

          {/* Preview */}
          <PostPreview
            accountName={selectedAccount?.name || "Your Account"}
            content={content}
            imageUrl={currentImage?.url}
          />

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
