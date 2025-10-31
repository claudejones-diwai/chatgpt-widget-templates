// Hook to get tool output data from window.openai.toolOutput
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export function useToolData<T = unknown>(): T | null {
  return useOpenAiGlobal<T>("toolOutput");
}
