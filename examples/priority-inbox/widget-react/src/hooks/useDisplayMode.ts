// Hook to get display mode from window.openai.displayMode
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export type DisplayMode = "inline" | "fullscreen" | "pip";

export function useDisplayMode(): DisplayMode | null {
  return useOpenAiGlobal<DisplayMode>("displayMode");
}
