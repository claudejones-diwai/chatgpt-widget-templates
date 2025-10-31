// Bottom overlay card for map view (mobile)
import { X, Star, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import type { Place } from "../../../shared-types";

interface BottomCardProps {
  place: Place;
  onClose: () => void;
}

export default function BottomCard({ place, onClose }: BottomCardProps) {
  // Format price level as dollar signs
  const priceDisplay = place.priceLevel
    ? "$".repeat(place.priceLevel)
    : null;

  // Use photos array if available, fallback to imageUrl
  const heroImage = place.photos?.[0] || place.imageUrl;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-gray-700 max-h-[40vh] overflow-y-auto"
    >
      <div className="p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Place Info */}
        <div className="flex gap-3">
          {/* Thumbnail */}
          {heroImage && (
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={heroImage}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 pr-8">
            {/* Title */}
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 leading-tight">
              {place.name}
            </h3>

            {/* Rating & Category */}
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
              {place.rating && (
                <div className="flex items-center gap-0.5 font-medium">
                  <Star className="h-3.5 w-3.5 fill-orange-400 stroke-orange-400" />
                  {place.rating.toFixed(1)}
                </div>
              )}
              {place.rating && <span>·</span>}
              <span className="capitalize">{place.category}</span>
              {(priceDisplay || place.priceRange) && <span>·</span>}
              {place.priceRange ? (
                <span>{place.priceRange}</span>
              ) : priceDisplay ? (
                <span className="text-green-600 dark:text-green-400 font-medium">{priceDisplay}</span>
              ) : null}
            </div>

            {/* Distance & Directions */}
            {place.distance && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <Navigation className="h-3.5 w-3.5" />
                  {place.distance < 1
                    ? `${Math.round(place.distance * 1000)}m away`
                    : `${place.distance.toFixed(1)}km away`
                  }
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Navigation className="h-3 w-3" />
                  Directions
                </a>
              </div>
            )}

            {/* Popular Items */}
            {place.popularItems && place.popularItems.length > 0 && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Popular:</span> {place.popularItems.slice(0, 2).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
