// Custom hook to access window.openai global values
// Based on OpenAI's implementation using useSyncExternalStore

import { useSyncExternalStore } from "react";
import { OpenAiGlobals, SET_GLOBALS_EVENT_TYPE } from "../../../shared-types";

/**
 * Subscribe to a specific key in window.openai
 * Returns null if window.openai or the key doesn't exist
 *
 * @example
 * const theme = useOpenAiGlobal("theme"); // "light" | "dark" | null
 * const displayMode = useOpenAiGlobal("displayMode"); // "inline" | "pip" | "fullscreen" | null
 */
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K
): OpenAiGlobals[K] | null {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = () => onChange();
      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });
      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai?.[key] ?? null,
    () => window.openai?.[key] ?? null
  );
}
