// Place List Component - Scrollable list of places
import type { Place } from "../../../shared-types";
import { formatPriceLevel, formatRating, getCategoryColor, truncate } from "../utils/format";

interface PlaceListProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceSelect: (place: Place) => void;
}

export function PlaceList({ places, selectedPlaceId, onPlaceSelect }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No places found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {places.map((place) => {
        const isSelected = place.id === selectedPlaceId;
        const colors = getCategoryColor(place.category);

        return (
          <button
            key={place.id}
            onClick={() => onPlaceSelect(place)}
            className={`
              w-full text-left p-4 transition-colors
              ${
                isSelected
                  ? "bg-primary-50 dark:bg-primary-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Category indicator */}
              <div
                className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0`}
                style={{ backgroundColor: colors.marker }}
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {place.name}
                </h4>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {truncate(place.description, 80)}
                </p>

                <div className="flex items-center gap-3 text-xs">
                  {place.rating && (
                    <span className="text-yellow-600 dark:text-yellow-500">
                      {formatRating(place.rating)}
                    </span>
                  )}
                  {place.priceLevel && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatPriceLevel(place.priceLevel)}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>
                    {place.category}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
