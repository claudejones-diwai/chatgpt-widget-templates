// Hook to get current display mode

import { useOpenAiGlobal } from "./useOpenAiGlobal";
import { DisplayMode } from "../../../shared-types";

/**
 * Returns the current display mode
 *
 * @returns "inline" | "pip" | "fullscreen" | null
 *
 * @example
 * const displayMode = useDisplayMode();
 *
 * if (displayMode === "fullscreen") {
 *   // Show fullscreen-only UI
 * }
 */
export function useDisplayMode(): DisplayMode | null {
  return useOpenAiGlobal("displayMode");
}
