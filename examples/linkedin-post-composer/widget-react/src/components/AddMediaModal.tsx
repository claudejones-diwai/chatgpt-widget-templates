import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";

export interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadMedia: (files: File[], mediaType: 'image' | 'carousel' | 'video') => void;
  isUploading?: boolean;
  mode?: 'replace' | 'append';
}

export function AddMediaModal({
  isOpen,
  onClose,
  onUploadMedia,
  isUploading = false,
  mode = 'replace'
}: AddMediaModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'images' | 'video' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setError(null);

    if (files.length === 0) return;

    // Detect media type
    const hasVideo = files.some(f => f.type.startsWith('video/'));
    const hasImage = files.some(f => f.type.startsWith('image/'));

    // Can't mix images and video
    if (hasVideo && hasImage) {
      setError("Cannot mix images and video. Please select either images only or a single video.");
      return;
    }

    if (hasVideo) {
      // Video validation
      if (files.length > 1) {
        setError("Only one video can be uploaded");
        return;
      }

      const file = files[0];
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        setError("Video must be MP4, MOV, or AVI format");
        return;
      }

      const maxSize = 200 * 1024 * 1024; // 200MB
      if (file.size > maxSize) {
        setError("Video must be less than 200MB");
        return;
      }

      setMediaType('video');
      setSelectedFiles([file]);
      setPreviewUrls([URL.createObjectURL(file)]);
    } else if (hasImage) {
      // Image validation
      if (files.length > 20) {
        setError("Maximum 20 images allowed");
        return;
      }

      const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setError("All files must be images (JPG, PNG, GIF, WebP)");
        return;
      }

      setMediaType('images');
      setSelectedFiles(files);
      const urls = files.map(f => URL.createObjectURL(f));
      setPreviewUrls(urls);
    } else {
      setError("Please select valid image or video files");
    }
  };

  const handleDone = () => {
    if (!selectedFiles.length) return;

    if (mediaType === 'images') {
      // When in append mode, always treat as carousel (even single images)
      // When in replace mode, single image = 'image', 2+ images = 'carousel'
      const type = mode === 'append'
        ? 'carousel'
        : (selectedFiles.length === 1 ? 'image' : 'carousel');
      onUploadMedia(selectedFiles, type);
    } else if (mediaType === 'video') {
      onUploadMedia(selectedFiles, 'video');
    }

    handleClose();
  };

  const handleClose = () => {
    // Cleanup
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    setSelectedFiles([]);
    setPreviewUrls([]);
    setMediaType(null);
    setError(null);
    onClose();
  };

  const canSubmit = selectedFiles.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-slide-down">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {/* Upload Button */}
            {selectedFiles.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Click to upload media
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select 1-20 images or 1 video
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    (Images: JPG, PNG, GIF, WebP • Video: MP4, MOV, AVI)
                  </p>
                </div>
              </button>
            )}

            {/* Preview - Images */}
            {mediaType === 'images' && previewUrls.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {previewUrls.length} image{previewUrls.length !== 1 ? 's' : ''} selected
                    {previewUrls.length === 1 && ' (single image post)'}
                    {previewUrls.length >= 2 && ' (carousel post)'}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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

            {/* Preview - Video */}
            {mediaType === 'video' && previewUrls.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Video selected: {selectedFiles[0]?.name}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>
                <video
                  src={previewUrls[0]}
                  controls
                  className="w-full rounded-lg bg-black"
                />
              </div>
            )}
          </div>

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
