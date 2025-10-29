// Main App Component

import { useState } from "react";
import {
  useTheme,
  useDisplayMode,
  useMaxHeight,
  useToolData,
} from "./hooks";
import {
  ErrorBoundary,
  LoadingState,
  DevMode,
  ErrorState,
  InputForm,
  DataDisplay,
} from "./components";
import { HelloWorldToolInput, HelloWorldToolOutput } from "../../shared-types";

export default function App() {
  const theme = useTheme();
  const displayMode = useDisplayMode();
  const maxHeight = useMaxHeight();
  const toolData = useToolData<HelloWorldToolOutput>();
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (data: HelloWorldToolInput) => {
    setIsLoading(true);
    try {
      // Call MCP tool
      await window.openai?.callTool("{{TOOL_NAME}}", data);
      // Widget will re-render with new toolData
    } catch (error) {
      console.error("Tool call failed:", error);
      alert("Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    window.location.reload();
  };

  // Apply theme class to root
  const themeClass = theme === "dark" ? "dark" : "";

  // Determine container styling based on display mode
  const containerMaxWidth =
    displayMode === "fullscreen"
      ? "max-w-4xl"
      : displayMode === "pip"
      ? "max-w-md"
      : "max-w-2xl";

  // Development mode - no tool data
  if (!toolData) {
    return (
      <div className={themeClass}>
        <DevMode />
      </div>
    );
  }

  // Error state
  if (toolData.error) {
    return (
      <div className={themeClass}>
        <div
          style={{ maxHeight: maxHeight ?? undefined }}
          className="overflow-y-auto"
        >
          <ErrorState message={toolData.message || "An error occurred"} onRetry={handleReset} />
        </div>
      </div>
    );
  }

  // Main widget UI
  return (
    <ErrorBoundary>
      <div className={themeClass}>
        <div
          style={{ maxHeight: maxHeight ?? undefined }}
          className="overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-screen"
        >
          <div className={`${containerMaxWidth} mx-auto p-6`}>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{WIDGET_NAME}}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {{TOOL_DESCRIPTION}}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {isLoading ? (
                <LoadingState message="Processing your request..." />
              ) : toolData.greeting ? (
                <DataDisplay data={toolData} onReset={handleReset} />
              ) : (
                <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
              )}
            </div>

            {/* Display mode indicator (dev only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-500 text-center">
                Mode: {displayMode || "unknown"} | Theme: {theme || "unknown"}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
