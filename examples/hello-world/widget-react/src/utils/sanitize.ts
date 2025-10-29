// XSS Prevention Utilities

/**
 * Escapes HTML to prevent XSS attacks
 * Use this before inserting user-generated content into HTML
 *
 * @example
 * const safeContent = escapeHtml(userInput);
 * element.innerHTML = safeContent;
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validates if a URL is safe to open
 * Only allows http:// and https:// protocols
 *
 * @example
 * if (isSafeUrl(data.link)) {
 *   window.open(data.link, '_blank', 'noopener,noreferrer');
 * }
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizes a string for use in HTML attributes
 */
export function sanitizeAttribute(text: string): string {
  return text
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
