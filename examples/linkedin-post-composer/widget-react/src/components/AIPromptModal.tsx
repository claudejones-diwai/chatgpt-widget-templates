import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

export interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  suggestedPrompt?: string;
  isGenerating?: boolean;
}

export function AIPromptModal({
  isOpen,
  onClose,
  onGenerate,
  suggestedPrompt,
  isGenerating = false
}: AIPromptModalProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(suggestedPrompt || "Professional workspace with modern design elements");
      setError(null);
    }
  }, [isOpen, suggestedPrompt]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length < 10) {
      setError("Please enter at least 10 characters for the image prompt");
      return;
    }

    onGenerate(trimmedPrompt);
    onClose();
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  const canGenerate = prompt.trim().length >= 10 && !isGenerating;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Generate AI Image
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Image Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError(null);
              }}
              placeholder="Describe the image you want to generate..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {prompt.trim().length} / 10 characters minimum
            </p>
          </div>

          {/* Info Box */}
          {suggestedPrompt && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <span className="font-semibold">Tip:</span> This prompt was suggested by ChatGPT based on your post content. Feel free to edit it to match your vision.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-900 dark:text-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
}
