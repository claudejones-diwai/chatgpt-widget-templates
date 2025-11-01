import { useState, useRef, useEffect } from "react";
import { Upload, Sparkles, X, AlertCircle } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { validateFile, readFileAsDataURL } from "../utils/fileValidation";

interface ImageSectionProps {
  image?: {
    source: 'upload' | 'ai-generate' | 'url';
    url?: string;
    prompt?: string;
  };
  postType: 'text' | 'image' | 'video' | 'document' | 'carousel' | 'poll';
  suggestedPrompt?: string;
  onGenerateImage: (prompt: string) => void;
  onUploadImage: (file: File, dataUrl: string) => void;
  onRemoveImage: () => void;
  isGenerating: boolean;
  showImageStatus?: boolean;
}

export function ImageSection({
  image,
  postType,
  suggestedPrompt,
  onGenerateImage,
  onUploadImage,
  onRemoveImage: _onRemoveImage,
  isGenerating,
  showImageStatus = true
}: ImageSectionProps) {
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [imagePrompt, setImagePrompt] = useState(image?.prompt || suggestedPrompt || "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastImageUrl, setLastImageUrl] = useState<string | undefined>();
  const [wasGenerating, setWasGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update image prompt when suggested prompt changes
  useEffect(() => {
    if (suggestedPrompt && !image?.prompt) {
      setImagePrompt(suggestedPrompt);
    }
  }, [suggestedPrompt, image?.prompt]);

  // Track generation state to close editor when done
  useEffect(() => {
    if (isGenerating) {
      setWasGenerating(true);
    } else if (wasGenerating && image?.url) {
      // Generation complete - close editor
      setShowPromptEditor(false);
      setWasGenerating(false);
    }
  }, [isGenerating, image?.url, wasGenerating]);

  // Show toast when new image appears
  useEffect(() => {
    if (image?.url && image.url !== lastImageUrl) {
      setLastImageUrl(image.url);
      setShowToast(true);
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [image?.url, lastImageUrl]);

  const handleGenerate = () => {
    if (imagePrompt.trim().length >= 10) {
      onGenerateImage(imagePrompt.trim());
    }
  };

  const handleUploadClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
          Add to your post
        </label>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && showImageStatus && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out">
          <div className="px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">
              Image added! Click Preview to see it
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons - Always visible */}
      {!showPromptEditor && (
        <>
          <div className="flex gap-2">
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
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {image ? 'Replace Image' : 'Upload Image'}
            </button>
            <button
              onClick={() => setShowPromptEditor(true)}
              disabled={isGenerating || isUploadingFile}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          </div>
          {isGenerating || isUploadingFile ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">{isUploadingFile ? 'Uploading image...' : 'Generating image...'}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Supported: JPG, PNG • Max size: 10MB
            </p>
          )}
        </>
      )}

      {/* Prompt Editor */}
      {showPromptEditor && (
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
              onClick={() => setShowPromptEditor(false)}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={imagePrompt.trim().length < 10 || isGenerating}
              className="flex-1 px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
      )}
    </div>
  );
}
