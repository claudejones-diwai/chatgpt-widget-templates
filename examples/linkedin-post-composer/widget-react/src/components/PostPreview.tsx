import { ThumbsUp, MessageCircle, Repeat2, Send, Globe } from "lucide-react";

interface PostPreviewProps {
  accountName: string;
  content: string;
  imageUrl?: string;
}

export function PostPreview({ accountName, content, imageUrl }: PostPreviewProps) {
  const isEmpty = !content.trim() && !imageUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isEmpty ? "Start typing to see preview" : "How it will look on LinkedIn"}
        </span>
      </div>

      {/* LinkedIn Post Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
        {/* Post Header */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-linkedin-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {accountName.charAt(0).toUpperCase()}
            </div>

            {/* Account Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {accountName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Product Manager at TechCorp AI
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
            {content ? (
              content
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="text-gray-400 dark:text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Start typing in the Edit tab to see your post preview
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Your content will update here in real-time
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Post Image */}
        {imageUrl && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="w-full h-96 bg-gray-100 dark:bg-gray-800">
              <img
                src={imageUrl}
                alt="Post content"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Engagement Buttons */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ThumbsUp className="w-4 h-4" />
              Like
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Repeat2 className="w-4 h-4" />
              Repost
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {!isEmpty && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          This is a preview. The actual post may look slightly different on LinkedIn.
        </p>
      )}
    </div>
  );
}
