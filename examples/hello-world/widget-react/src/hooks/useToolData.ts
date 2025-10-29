// Hook to access tool output data

import { useOpenAiGlobal } from "./useOpenAiGlobal";
import { ToolOutput } from "../../../shared-types";

/**
 * Returns the tool output data from the MCP server
 * Automatically handles parsing if data is a string
 *
 * @returns ToolOutput | null
 *
 * @example
 * const toolData = useToolData();
 *
 * if (!toolData) {
 *   return <DevMode />;
 * }
 *
 * if (toolData.error) {
 *   return <ErrorState message={toolData.message} />;
 * }
 *
 * return <DataDisplay data={toolData} />;
 */
export function useToolData<T = ToolOutput>(): T | null {
  const rawData = useOpenAiGlobal("toolOutput");

  if (!rawData) {
    return null;
  }

  // If data is a string, try to parse it
  if (typeof rawData === "string") {
    try {
      return JSON.parse(rawData) as T;
    } catch (e) {
      console.error("Failed to parse tool data:", e);
      return {
        error: true,
        message: "Invalid data format received",
      } as T;
    }
  }

  return rawData as T;
}
