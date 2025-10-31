// Place Details Component - Inspector pattern from Pizzaz
import { motion } from "framer-motion";
import { Star, X } from "lucide-react";
import type { Place } from "../../../shared-types";

interface PlaceDetailsProps {
  place: Place;
  onClose: () => void;
}

export function PlaceDetails({ place, onClose }: PlaceDetailsProps) {
  if (!place) return null;

  // Format price level as dollar signs
  const priceDisplay = place.priceLevel
    ? "$".repeat(place.priceLevel)
    : null;

  const handleGetDirections = async () => {
    if (window.openai?.sendFollowUpMessage) {
      await window.openai.sendFollowUpMessage({
        prompt: `How do I get to ${place.name} in Playa del Carmen?`,
      });
    }
  };

  const handleFindSimilar = async () => {
    if (window.openai?.sendFollowUpMessage) {
      await window.openai.sendFollowUpMessage({
        prompt: `Show me more places like ${place.name}`,
      });
    }
  };

  return (
    <motion.div
      key={place.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", bounce: 0, duration: 0.25 }}
      className="absolute z-30 top-0 bottom-4 left-0 right-auto xl:left-auto xl:right-6 md:z-20 w-[340px] xl:w-[360px] xl:top-6 xl:bottom-8 pointer-events-auto"
    >
      <button
        aria-label="Close details"
        className="inline-flex absolute z-10 top-4 left-4 xl:top-4 xl:left-4 shadow-xl rounded-full p-2 bg-white dark:bg-gray-800 ring ring-black/10 dark:ring-white/10 xl:shadow-2xl hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={onClose}
      >
        <X className="h-[18px] w-[18px] text-gray-900 dark:text-gray-100" aria-hidden="true" />
      </button>
      <div className="relative h-full overflow-y-auto rounded-none xl:rounded-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 xl:shadow-xl xl:ring ring-black/10 dark:ring-white/10">
        {place.imageUrl && (
          <div className="relative mt-2 xl:mt-0 px-2 xl:px-0">
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full rounded-3xl xl:rounded-none h-80 object-cover xl:rounded-t-2xl"
            />
          </div>
        )}

        <div className="h-[calc(100%-11rem)] sm:h-[calc(100%-14rem)]">
          <div className="p-4 sm:p-5">
            <div className="text-2xl font-medium truncate">{place.name}</div>
            <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 flex items-center gap-1">
              {place.rating && (
                <>
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  {place.rating.toFixed(1)}
                </>
              )}
              {place.rating && priceDisplay && <span>·</span>}
              {priceDisplay && <span>{priceDisplay}</span>}
              <span>· Playa del Carmen</span>
            </div>
            <div className="mt-3 flex flex-row items-center gap-3 font-medium text-sm">
              <button
                onClick={handleGetDirections}
                className="rounded-full bg-[#F46C21] text-white cursor-pointer px-4 py-1.5 hover:bg-[#e35b10] transition-colors"
              >
                Get Directions
              </button>
              <button
                onClick={handleFindSimilar}
                className="rounded-full border border-[#F46C21]/50 text-[#F46C21] cursor-pointer px-4 py-1.5 hover:bg-[#F46C21]/10 transition-colors"
              >
                Find Similar
              </button>
            </div>
            <div className="text-sm mt-5 text-gray-700 dark:text-gray-300">
              {place.description}
            </div>
            {place.address && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                📍 {place.address}
              </div>
            )}
            {place.hours && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                🕐 {place.hours}
              </div>
            )}
          </div>

          {place.highlights && place.highlights.length > 0 && (
            <div className="px-4 sm:px-5 pb-4">
              <div className="text-lg font-medium mb-2">Highlights</div>
              <div className="flex flex-wrap gap-2">
                {place.highlights.map((highlight, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
