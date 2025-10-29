// Hook to get current theme

import { useOpenAiGlobal } from "./useOpenAiGlobal";
import { Theme } from "../../../shared-types";

/**
 * Returns the current theme
 *
 * @returns "light" | "dark" | null
 *
 * @example
 * const theme = useTheme();
 *
 * return (
 *   <div className={theme === "dark" ? "dark" : ""}>
 *     {content}
 *   </div>
 * );
 */
export function useTheme(): Theme | null {
  return useOpenAiGlobal("theme");
}
