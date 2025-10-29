// Formatting Utilities

/**
 * Formats a date based on the user's locale
 *
 * @example
 * const formatted = formatDate(new Date(), "en-US");
 * // "January 1, 2024"
 */
export function formatDate(
  date: Date | string,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * Formats a date with time
 *
 * @example
 * const formatted = formatDateTime(new Date(), "en-US");
 * // "January 1, 2024, 12:00 PM"
 */
export function formatDateTime(
  date: Date | string,
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Formats a number based on the user's locale
 *
 * @example
 * const formatted = formatNumber(1234.56, "en-US");
 * // "1,234.56"
 */
export function formatNumber(
  value: number,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats a currency value
 *
 * @example
 * const formatted = formatCurrency(99.99, "en-US", "USD");
 * // "$99.99"
 */
export function formatCurrency(
  value: number,
  locale: string = "en-US",
  currency: string = "USD"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Formats relative time (e.g., "2 days ago")
 *
 * @example
 * const formatted = formatRelativeTime(new Date(Date.now() - 86400000), "en-US");
 * // "yesterday"
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - dateObj.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}
