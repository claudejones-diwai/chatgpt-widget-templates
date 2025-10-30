// Place Details Component - Shows full details of selected place
import type { Place } from "../../../shared-types";
import { formatPriceLevel, formatRating, getCategoryColor, formatCategory } from "../utils/format";

interface PlaceDetailsProps {
  place: Place;
  onClose: () => void;
}

export function PlaceDetails({ place, onClose }: PlaceDetailsProps) {
  const colors = getCategoryColor(place.category);

  const handleGetDirections = async () => {
    await window.openai?.sendFollowUpMessage({
      prompt: `How do I get to ${place.name} in Playa del Carmen?`,
    });
  };

  const handleFindSimilar = async () => {
    await window.openai?.sendFollowUpMessage({
      prompt: `Show me more places like ${place.name}`,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
      {/* Header with close button */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
              {formatCategory(place.category)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {place.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Rating and Price */}
      {(place.rating || place.priceLevel) && (
        <div className="flex items-center gap-4 mb-4">
          {place.rating && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-lg">{formatRating(place.rating)}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{place.rating}</span>
            </div>
          )}
          {place.priceLevel && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatPriceLevel(place.priceLevel)}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4">{place.description}</p>

      {/* Highlights */}
      {place.highlights && place.highlights.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Highlights</h4>
          <div className="flex flex-wrap gap-2">
            {place.highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-gray-500 dark:text-gray-400">📍</span>
          <span className="text-gray-700 dark:text-gray-300">{place.address}</span>
        </div>
        {place.hours && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 dark:text-gray-400">🕐</span>
            <span className="text-gray-700 dark:text-gray-300">{place.hours}</span>
          </div>
        )}
        {place.phone && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 dark:text-gray-400">📞</span>
            <span className="text-gray-700 dark:text-gray-300">{place.phone}</span>
          </div>
        )}
        {place.website && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 dark:text-gray-400">🌐</span>
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Visit Website
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleGetDirections}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Get Directions
        </button>
        <button
          onClick={handleFindSimilar}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Find Similar
        </button>
      </div>
    </div>
  );
}
