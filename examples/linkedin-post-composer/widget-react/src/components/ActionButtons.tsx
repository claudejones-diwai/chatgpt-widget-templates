import { Send, Loader2, ExternalLink } from "lucide-react";

interface ActionButtonsProps {
  onPublish: () => void;
  isPublishing: boolean;
  canPublish: boolean;
  publishResult?: {
    success: boolean;
    postUrl?: string;
    message: string;
  };
}

export function ActionButtons({ onPublish, isPublishing, canPublish, publishResult }: ActionButtonsProps) {
  if (publishResult?.success) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Published successfully!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1 whitespace-pre-wrap">
                {publishResult.message}
              </p>
              {publishResult.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View Post on LinkedIn
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (publishResult && !publishResult.success) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Failed to publish
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {publishResult.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onPublish}
            disabled={!canPublish}
            className="flex-1 px-6 py-3 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => window.location.reload()}
        disabled={isPublishing}
        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Cancel
      </button>
      <button
        onClick={onPublish}
        disabled={!canPublish || isPublishing}
        className="flex-1 px-6 py-3 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
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
  );
}
