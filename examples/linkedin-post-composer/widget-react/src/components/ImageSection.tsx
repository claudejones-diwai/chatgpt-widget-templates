import { useState } from "react";
import { Upload, Sparkles, X, RefreshCw } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

interface ImageSectionProps {
  image?: {
    source: 'upload' | 'ai-generate' | 'url';
    url?: string;
    prompt?: string;
  };
  onGenerateImage: (prompt: string) => void;
  onRemoveImage: () => void;
  isGenerating: boolean;
}

export function ImageSection({ image, onGenerateImage, onRemoveImage, isGenerating }: ImageSectionProps) {
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [imagePrompt, setImagePrompt] = useState(image?.prompt || "");

  const handleGenerate = () => {
    if (imagePrompt.trim().length >= 10) {
      onGenerateImage(imagePrompt.trim());
      setShowPromptEditor(false);
    }
  };

  const handleRegenerate = () => {
    if (imagePrompt.trim().length >= 10) {
      onGenerateImage(imagePrompt.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Add to your post
        </label>
      </div>

      {/* Action Buttons */}
      {!image && !showPromptEditor && (
        <div className="flex gap-2">
          <button
            onClick={() => alert("File upload coming in Phase 2!")}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
          <button
            onClick={() => setShowPromptEditor(true)}
            className="flex-1 px-4 py-3 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </button>
        </div>
      )}

      {/* Prompt Editor */}
      {showPromptEditor && !image && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Describe the image you want to generate
          </label>
          <TextareaAutosize
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Professional tech workspace with AI elements, modern design, blue and orange color scheme..."
            minRows={3}
            maxRows={6}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-linkedin-500 dark:focus:ring-linkedin-400 text-sm"
          />
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{imagePrompt.length} / 500 characters</span>
            {imagePrompt.length < 10 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                Minimum 10 characters
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPromptEditor(false);
                setImagePrompt("");
              }}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={imagePrompt.trim().length < 10 || isGenerating}
              className="flex-1 px-4 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
      )}

      {/* Image Preview */}
      {image?.url && (
        <div className="space-y-3">
          <div className="relative group">
            <img
              src={image.url}
              alt="Post image"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={onRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {image.source === 'ai-generate' && image.prompt && (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Image Prompt (editable)
              </label>
              <TextareaAutosize
                value={imagePrompt || image.prompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                minRows={2}
                maxRows={4}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-linkedin-500 dark:focus:ring-linkedin-400 text-sm"
              />
              <button
                onClick={handleRegenerate}
                disabled={imagePrompt.trim().length < 10 || isGenerating}
                className="w-full px-4 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Image
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
