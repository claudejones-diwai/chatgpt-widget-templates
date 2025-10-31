// Persistent right sidebar with collapse/expand
import React from "react";
import { Star, CircleDot, Sparkles, Navigation, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { Place } from "../../../shared-types";

interface PlaceListItemProps {
  place: Place;
  isSelected: boolean;
  onClick: () => void;
}

function PlaceListItem({ place, isSelected, onClick }: PlaceListItemProps) {
  // Format price level as dollar signs
  const priceDisplay = place.priceLevel
    ? "$".repeat(place.priceLevel)
    : null;

  // Use photos array if available, fallback to imageUrl
  const heroImage = place.photos?.[0] || place.imageUrl;

  const handleClick = () => {
    onClick();

    // Scroll this card into view immediately when clicked
    setTimeout(() => {
      const cardEl = document.getElementById(`place-card-${place.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }, 150);
  };

  return (
    <div
      id={`place-card-${place.id}`}
      className={
        "mb-3 rounded-xl overflow-hidden cursor-pointer transition-all border " +
        (isSelected
          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800")
      }
    >
      <button
        className="w-full text-left"
        onClick={handleClick}
      >
        <div className="flex gap-3 p-3">
          {/* Thumbnail */}
          {heroImage && (
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={heroImage}
                alt={place.name}
                className="w-full h-full object-cover"
              />
              {/* Open Now Badge */}
              {place.openNow !== undefined && (
                <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5 ${
                  place.openNow
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  <CircleDot className="h-2 w-2" />
                  {place.openNow ? 'Open' : 'Closed'}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Title */}
            <div>
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">
                {place.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {place.category}
              </div>
            </div>

            {/* Rating, Price, Distance */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-600 dark:text-gray-400">
              {place.rating && (
                <div className="flex items-center gap-0.5 font-medium">
                  <Star className="h-3 w-3 fill-orange-400 stroke-orange-400" />
                  {place.rating.toFixed(1)}
                </div>
              )}
              {place.rating && (priceDisplay || place.priceRange) && <span>·</span>}
              {place.priceRange ? (
                <span className="text-[11px]">{place.priceRange}</span>
              ) : priceDisplay ? (
                <span className="text-green-600 dark:text-green-400 font-medium">{priceDisplay}</span>
              ) : null}
              {place.distance && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-0.5 font-medium text-blue-600 dark:text-blue-400">
                    <Navigation className="h-3 w-3" />
                    {place.distance < 1
                      ? `${Math.round(place.distance * 1000)}m`
                      : `${place.distance.toFixed(1)}km`
                    }
                  </div>
                </>
              )}
            </div>

            {/* Popular Items - always show 1 line */}
            {place.popularItems && place.popularItems.length > 0 && (
              <div className="flex items-start gap-1 text-[11px]">
                <Sparkles className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400 leading-snug line-clamp-1">
                  {place.popularItems.slice(0, 2).join(', ')}
                </span>
              </div>
            )}

            {/* Get Directions Button - always visible if distance available */}
            {place.distance && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Navigation className="h-3 w-3" />
                Directions
              </a>
            )}
          </div>
        </div>

        {/* Expanded Details - Show amenities when selected */}
        {isSelected && place.amenities && place.amenities.length > 0 && (
          <div className="px-3 pb-3 pt-0">
            <div className="flex flex-wrap gap-1.5">
              {place.amenities.slice(0, 6).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {amenity}
                </span>
              ))}
              {place.amenities.length > 6 && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  +{place.amenities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

interface SidebarProps {
  places: Place[];
  selectedId: string | null;
  onSelect: (place: Place) => void;
}

export default function Sidebar({ places, selectedId, onSelect }: SidebarProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Scroll selected card into view when selection changes
  React.useEffect(() => {
    if (!selectedId || isCollapsed) return;

    // Add a small delay to ensure DOM is ready and sidebar is expanded
    const timeoutId = setTimeout(() => {
      const cardEl = document.getElementById(`place-card-${selectedId}`);
      if (cardEl && scrollRef.current) {
        // Scroll the card into view within the sidebar
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedId, isCollapsed]);

  return (
    <>
      {/* Toggle Button - Fixed position */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-30 w-8 h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center shadow-lg"
        style={{ right: isCollapsed ? '0px' : '420px' }}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Sidebar */}
      {!isCollapsed && (
        <motion.div
          className="absolute inset-y-0 right-0 z-20 pointer-events-auto w-[420px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto px-3 py-4"
          >
            {/* Header */}
            <div className="mb-4 px-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {places.length} result{places.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Click to view details
              </div>
            </div>

            {/* Place Cards */}
            <div>
              {places.map((place) => (
                <PlaceListItem
                  key={place.id}
                  place={place}
                  isSelected={selectedId === place.id}
                  onClick={() => onSelect(place)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
