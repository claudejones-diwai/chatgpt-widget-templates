import { useState, useRef } from "react";
import { X, Upload, FileText, File } from "lucide-react";

export interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadDocument: (file: File) => void;
  isUploading?: boolean;
}

export function AddDocumentModal({
  isOpen,
  onClose,
  onUploadDocument,
  isUploading = false
}: AddDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    name: string;
    type: string;
    size: number;
    icon: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please select a valid document (PDF, Word, or PowerPoint)");
      return;
    }

    // Validate file size (50MB max for LinkedIn documents)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError("Document must be less than 50MB");
      return;
    }

    // Determine icon based on file type
    let icon = 'file';
    if (file.type === 'application/pdf') {
      icon = 'pdf';
    } else if (file.type.includes('word')) {
      icon = 'word';
    } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
      icon = 'powerpoint';
    }

    setSelectedFile(file);
    setPreviewData({
      name: file.name,
      type: file.type,
      size: file.size,
      icon
    });
  };

  const handleDone = () => {
    if (!selectedFile) return;
    onUploadDocument(selectedFile);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setError(null);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (icon: string) => {
    if (icon === 'pdf') {
      return (
        <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
          <FileText className="w-8 h-8 text-white" />
        </div>
      );
    } else if (icon === 'word') {
      return (
        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
          <FileText className="w-8 h-8 text-white" />
        </div>
      );
    } else if (icon === 'powerpoint') {
      return (
        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
          <FileText className="w-8 h-8 text-white" />
        </div>
      );
    }

    return (
      <div className="w-16 h-16 bg-gray-500 rounded-lg flex items-center justify-center">
        <File className="w-8 h-8 text-white" />
      </div>
    );
  };

  const canSubmit = selectedFile !== null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add Document
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
              accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {/* Upload Button */}
            {!selectedFile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Click to upload document
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF, Word, or PowerPoint
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    (Max 50MB)
                  </p>
                </div>
              </button>
            )}

            {/* Preview */}
            {previewData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Document selected
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>

                {/* Document Card */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    {getFileIcon(previewData.icon)}

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {previewData.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatFileSize(previewData.size)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Ready to upload
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-3 bg-surface-secondary border border-border rounded-lg">
                  <p className="text-xs text-text-primary">
                    <span className="font-semibold">Note:</span> Your document will be uploaded to LinkedIn and displayed in your post. Viewers can download the document.
                  </p>
                </div>
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
