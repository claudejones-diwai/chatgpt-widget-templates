// Hook to access window.openai global properties
// Pattern from: https://github.com/openai/openai-apps-sdk-examples/blob/main/src/use-openai-global.ts
import { useSyncExternalStore } from "react";

type OpenAiKey = "theme" | "displayMode" | "maxHeight" | "toolOutput" | "widgetState" | "locale";

const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

export function useOpenAiGlobal<T = unknown>(key: OpenAiKey): T | null {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleSetGlobal = (event: CustomEvent) => {
        const value = event.detail?.globals?.[key];
        if (value === undefined) {
          return;
        }
        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal as EventListener, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal as EventListener);
      };
    },
    () => (typeof window !== "undefined" && window.openai ? (window.openai[key] as T) ?? null : null),
    () => null // server snapshot
  );
}
