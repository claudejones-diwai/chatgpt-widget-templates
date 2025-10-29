// Data Display Component
// Displays tool output data

import { HelloWorldToolOutput } from "../../../shared-types";
import { formatDateTime } from "../utils/format";
import { useOpenAiGlobal } from "../hooks";

interface DataDisplayProps {
  data: HelloWorldToolOutput;
  onReset?: () => void;
}

export function DataDisplay({ data, onReset }: DataDisplayProps) {
  const locale = useOpenAiGlobal("locale") || "en-US";

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
                    border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {data.greeting}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data.formal ? "Formal" : "Casual"} greeting •{" "}
          {formatDateTime(data.timestamp, locale)}
        </div>
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="w-full min-h-[44px] px-6 py-3 bg-gray-200 hover:bg-gray-300
                   dark:bg-gray-700 dark:hover:bg-gray-600
                   text-gray-900 dark:text-gray-100 font-medium rounded-lg
                   transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
        Powered by Hello World
      </div>
    </div>
  );
}
