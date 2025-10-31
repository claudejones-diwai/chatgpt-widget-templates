import { useOpenAiGlobal } from "./useOpenAiGlobal";

export type DisplayMode = "full" | "compact";

export function useDisplayMode(): DisplayMode | null {
  return useOpenAiGlobal<DisplayMode>("displayMode");
}
