// Hook to get max height constraint from window.openai.maxHeight
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export function useMaxHeight(): number | null {
  return useOpenAiGlobal<number>("maxHeight");
}
