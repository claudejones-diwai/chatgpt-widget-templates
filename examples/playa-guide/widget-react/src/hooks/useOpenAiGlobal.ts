// Hook to access window.openai global properties
import { useState, useEffect } from "react";

type OpenAiKey = "theme" | "displayMode" | "maxHeight" | "toolOutput" | "widgetState" | "locale";

export function useOpenAiGlobal<T = unknown>(key: OpenAiKey): T | null {
  const [value, setValue] = useState<T | null>(() => {
    if (typeof window !== "undefined" && window.openai) {
      return (window.openai[key] as T) ?? null;
    }
    return null;
  });

  useEffect(() => {
    // Try to use subscribe if available
    if (typeof window !== "undefined" && window.openai?.subscribe) {
      return window.openai.subscribe(() => {
        if (window.openai) {
          setValue((window.openai[key] as T) ?? null);
        }
      });
    }

    // Fallback: poll for changes every 100ms
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.openai) {
        const newValue = (window.openai[key] as T) ?? null;
        setValue((prev) => {
          // Only update if value actually changed
          if (JSON.stringify(prev) !== JSON.stringify(newValue)) {
            return newValue;
          }
          return prev;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [key]);

  return value;
}
