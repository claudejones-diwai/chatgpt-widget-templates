// Hook to get current theme from window.openai.theme
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export type Theme = "light" | "dark";

export function useTheme(): Theme | null {
  return useOpenAiGlobal<Theme>("theme");
}
