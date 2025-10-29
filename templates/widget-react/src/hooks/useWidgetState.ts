// Hook for persistent widget state
// Based on OpenAI's implementation

import { useState, useEffect, SetStateAction } from "react";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

/**
 * Manages persistent widget state across sessions
 * State is saved via window.openai.setWidgetState()
 *
 * @param defaultState - Default state if none exists
 * @returns [state, setState] - Similar to useState
 *
 * @example
 * const [favorites, setFavorites] = useWidgetState<string[]>([]);
 *
 * const toggleFavorite = (id: string) => {
 *   setFavorites(prev =>
 *     prev.includes(id)
 *       ? prev.filter(f => f !== id)
 *       : [...prev, id]
 *   );
 * };
 */
export function useWidgetState<T = Record<string, unknown>>(
  defaultState?: T
): [T | null, (state: SetStateAction<T>) => void] {
  const widgetState = useOpenAiGlobal("widgetState") as T | null;
  const [localState, setLocalState] = useState<T | null>(
    widgetState ?? defaultState ?? null
  );

  // Sync with window.openai.widgetState changes
  useEffect(() => {
    if (widgetState !== undefined) {
      setLocalState(widgetState);
    }
  }, [widgetState]);

  const setState = (newState: SetStateAction<T>) => {
    const resolvedState =
      typeof newState === "function"
        ? (newState as (prev: T | null) => T)(localState)
        : newState;

    setLocalState(resolvedState);

    // Persist to window.openai
    if (window.openai?.setWidgetState) {
      window.openai.setWidgetState(resolvedState).catch((error) => {
        console.error("Failed to persist widget state:", error);
      });
    }
  };

  return [localState, setState];
}
