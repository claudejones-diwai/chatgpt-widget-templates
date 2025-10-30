// Filter Bar Component for category selection
import { formatCategory } from "../utils/format";

interface FilterBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  "all",
  "restaurants",
  "beaches",
  "activities",
  "nightlife",
  "shopping",
  "hotels",
];

export function FilterBar({ activeCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors
              ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {formatCategory(category)}
          </button>
        );
      })}
    </div>
  );
}
