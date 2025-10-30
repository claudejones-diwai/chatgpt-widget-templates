// Hook to access window.openai global properties
import { useSyncExternalStore } from "react";

type OpenAiKey = "theme" | "displayMode" | "maxHeight" | "toolOutput" | "widgetState" | "locale";

export function useOpenAiGlobal<T = unknown>(key: OpenAiKey): T | null {
  const subscribe = (callback: () => void) => {
    if (typeof window !== "undefined" && window.openai?.subscribe) {
      return window.openai.subscribe(callback);
    }
    return () => {}; // No-op unsubscribe
  };

  const getSnapshot = (): T | null => {
    if (typeof window !== "undefined" && window.openai) {
      return (window.openai[key] as T) ?? null;
    }
    return null;
  };

  const getServerSnapshot = (): T | null => null;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
