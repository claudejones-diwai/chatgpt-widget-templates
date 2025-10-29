// Hook to get maximum height constraint

import { useOpenAiGlobal } from "./useOpenAiGlobal";

/**
 * Returns the maximum height in pixels for the widget
 * Always respect this value with overflow-y: auto
 *
 * @returns number (pixels) | null
 *
 * @example
 * const maxHeight = useMaxHeight();
 *
 * return (
 *   <div style={{ maxHeight, overflowY: 'auto' }}>
 *     {content}
 *   </div>
 * );
 */
export function useMaxHeight(): number | null {
  return useOpenAiGlobal("maxHeight");
}
