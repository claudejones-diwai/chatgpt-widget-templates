// Formatting utility functions

/**
 * Format price level (1-4) to $ symbols
 */
export function formatPriceLevel(level?: number): string {
  if (!level) return "";
  return "$".repeat(Math.min(level, 4));
}

/**
 * Format rating as stars
 */
export function formatRating(rating?: number): string {
  if (!rating) return "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return "★".repeat(fullStars) + (hasHalfStar ? "½" : "") + "☆".repeat(5 - Math.ceil(rating));
}

/**
 * Get category display name
 */
export function formatCategory(category: string): string {
  const categoryNames: Record<string, string> = {
    restaurant: "Restaurant",
    beach: "Beach",
    activity: "Activity",
    nightlife: "Nightlife",
    shopping: "Shopping",
    hotel: "Hotel",
    all: "All Places",
  };
  return categoryNames[category] || category;
}

/**
 * Get category color for markers/badges
 */
export function getCategoryColor(category: string): {
  bg: string;
  text: string;
  marker: string;
} {
  const colors: Record<string, { bg: string; text: string; marker: string }> = {
    restaurant: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      marker: "#ef4444", // red-500
    },
    beach: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      marker: "#3b82f6", // blue-500
    },
    activity: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      marker: "#22c55e", // green-500
    },
    nightlife: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-300",
      marker: "#a855f7", // purple-500
    },
    shopping: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
      marker: "#eab308", // yellow-500
    },
    hotel: {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-700 dark:text-pink-300",
      marker: "#ec4899", // pink-500
    },
  };

  return (
    colors[category] || {
      bg: "bg-gray-100 dark:bg-gray-900/30",
      text: "text-gray-700 dark:text-gray-300",
      marker: "#6b7280", // gray-500
    }
  );
}

/**
 * Truncate text to max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
