import { useOpenAiGlobal } from "./useOpenAiGlobal";

export function useToolData<T = unknown>(): T | null {
  return useOpenAiGlobal<T>("toolOutput");
}
