import { useState, useRef } from "react";
import { X, Upload, Image, Video } from "lucide-react";

export interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadImages: (files: File[]) => void;
  onUploadVideo: (file: File) => void;
  isUploading?: boolean;
}

type MediaTab = 'images' | 'video';

export function AddMediaModal({
  isOpen,
  onClose,
  onUploadImages,
  onUploadVideo,
  isUploading = false
}: AddMediaModalProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>('images');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setError(null);

    // Validate: 2-20 images
    if (files.length < 2) {
      setError("Please select at least 2 images for a carousel");
      return;
    }
    if (files.length > 20) {
      setError("Maximum 20 images allowed");
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError("All files must be images (JPG, PNG, GIF, WebP)");
      return;
    }

    // Generate previews
    setSelectedFiles(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      setError("Video must be MP4, MOV, or AVI format");
      return;
    }

    // Validate file size (200MB max)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      setError("Video must be less than 200MB");
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleDone = () => {
    if (activeTab === 'images' && selectedFiles.length >= 2) {
      onUploadImages(selectedFiles);
      handleClose();
    } else if (activeTab === 'video' && videoFile) {
      onUploadVideo(videoFile);
      handleClose();
    }
  };

  const handleClose = () => {
    // Cleanup
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setSelectedFiles([]);
    setPreviewUrls([]);
    setVideoFile(null);
    setVideoPreview(null);
    setError(null);
    onClose();
  };

  const canSubmit = (activeTab === 'images' && selectedFiles.length >= 2) ||
                     (activeTab === 'video' && videoFile !== null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add Media
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('images')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === 'images'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
            disabled={isUploading}
          >
            <div className="flex items-center justify-center gap-2">
              <Image className="w-4 h-4" />
              Upload Images (2-20)
            </div>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === 'video'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
            disabled={isUploading}
          >
            <div className="flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />
              Upload Video
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'images' ? (
            <div className="space-y-4">
              {/* File Input */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={isUploading}
              />

              {/* Upload Button */}
              {selectedFiles.length === 0 && (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Select 2-20 images (JPG, PNG, GIF, WebP)
                    </p>
                  </div>
                </button>
              )}

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {previewUrls.length} image{previewUrls.length !== 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      Change
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Input */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo"
                onChange={handleVideoSelect}
                className="hidden"
                disabled={isUploading}
              />

              {/* Upload Button */}
              {!videoFile && (
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Click to upload video
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      MP4, MOV, or AVI (max 200MB)
                    </p>
                  </div>
                </button>
              )}

              {/* Video Preview */}
              {videoPreview && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Video selected: {videoFile?.name}
                    </p>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      Change
                    </button>
                  </div>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg bg-black"
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-900 dark:text-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={!canSubmit || isUploading}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
