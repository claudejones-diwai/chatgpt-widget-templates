import TextareaAutosize from "react-textarea-autosize";

interface ContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

const MAX_LENGTH = 3000;
const WARNING_THRESHOLD = 0.8;  // 80% - Yellow zone

export function ContentEditor({ content, onContentChange }: ContentEditorProps) {
  const charCount = content.length;
  const percentage = (charCount / MAX_LENGTH) * 100;
  const isWarning = charCount > MAX_LENGTH * WARNING_THRESHOLD;
  const isOverLimit = charCount > MAX_LENGTH;

  // Determine progress bar color
  let progressColor = 'bg-green-500';
  if (isOverLimit) {
    progressColor = 'bg-red-500';
  } else if (isWarning) {
    progressColor = 'bg-yellow-500';
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        What would you like to share?
      </label>
      <div className="relative">
        <TextareaAutosize
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Share your thoughts, news, or updates with your network..."
          minRows={4}
          maxRows={12}
          className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors ${
            isOverLimit
              ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
              : "border-gray-300 dark:border-gray-600 focus:ring-linkedin-500 dark:focus:ring-linkedin-400"
          }`}
        />
      </div>

      {/* Character Counter with Progress Bar */}
      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Counter Text */}
        <div className="flex items-center justify-between text-xs">
          <span className={`${isOverLimit ? "text-red-600 dark:text-red-400 font-medium" : isWarning ? "text-yellow-600 dark:text-yellow-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
            {charCount} / {MAX_LENGTH} characters
          </span>
          {isOverLimit && (
            <span className="text-red-600 dark:text-red-400 font-medium">
              {charCount - MAX_LENGTH} over limit
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
