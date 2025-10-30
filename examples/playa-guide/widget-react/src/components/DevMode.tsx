// Development Mode Component
// Shows when widget is opened outside of ChatGPT

export function DevMode() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Development Mode
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This widget should be loaded by ChatGPT. Place data will appear here
          when invoked from a conversation.
        </p>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-left">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
            <strong>Available APIs:</strong>
            <br />
            - window.openai.theme
            <br />
            - window.openai.displayMode
            <br />
            - window.openai.maxHeight
            <br />
            - window.openai.toolOutput
            <br />- window.openai.sendFollowUpMessage()
          </p>
        </div>
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          <p>To test locally, mock window.openai in your browser console</p>
        </div>
      </div>
    </div>
  );
}
