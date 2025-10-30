// Main App Component
import { useState, useMemo } from "react";
import { useTheme, useDisplayMode, useMaxHeight, useToolData } from "./hooks";
import { DevMode, ErrorState, Map, PlaceList, PlaceDetails, FilterBar } from "./components";
import type { FindPlacesOutput, Place } from "../../shared-types";

export default function App() {
  const theme = useTheme();
  const displayMode = useDisplayMode();
  const maxHeight = useMaxHeight();
  const toolData = useToolData<FindPlacesOutput>();

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Apply theme class to root
  const themeClass = theme === "dark" ? "dark" : "";

  // Filter places by active category
  const filteredPlaces = useMemo(() => {
    if (!toolData?.places) return [];
    if (activeCategory === "all") return toolData.places;

    // Normalize category: handle both singular ("restaurant") and plural ("restaurants")
    const normalizedActive = activeCategory.replace(/s$/, ""); // Remove trailing 's'
    return toolData.places.filter((place) => {
      const normalizedPlace = place.category.replace(/s$/, "");
      return normalizedPlace === normalizedActive;
    });
  }, [toolData?.places, activeCategory]);

  // Development mode - no tool data
  if (!toolData) {
    return (
      <div className={themeClass}>
        <DevMode />
      </div>
    );
  }

  // Error state
  if (toolData.error) {
    return (
      <div className={themeClass}>
        <div style={{ maxHeight: maxHeight ?? undefined }} className="overflow-y-auto">
          <ErrorState message={toolData.message || "An error occurred"} />
        </div>
      </div>
    );
  }

  // Determine layout based on display mode
  const isPip = displayMode === "pip";
  const isFullscreen = displayMode === "fullscreen";

  return (
    <div className={themeClass}>
      <div
        style={{
          height: maxHeight ? `${maxHeight}px` : '100vh',
        }}
        className="bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Playa del Carmen Guide
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredPlaces.length} {activeCategory === "all" ? "place" : activeCategory}
              {filteredPlaces.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-7xl mx-auto">
            <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`
            ${isPip ? "flex flex-col" : "flex flex-col md:flex-row"}
            max-w-7xl mx-auto p-4 gap-4 flex-1
          `}
          style={{
            minHeight: 0, // Allow flex shrinking
          }}
        >
          {/* Map */}
          <div className={`${isPip ? "h-[250px]" : "flex-1 h-full"} rounded-lg overflow-hidden`}>
            <Map
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onPlaceSelect={setSelectedPlace}
              theme={theme}
              centerCoordinates={toolData.centerCoordinates}
            />
          </div>

          {/* Sidebar */}
          <div
            className={`
              ${isPip ? "flex-1" : isFullscreen ? "w-96" : "w-80"}
              flex flex-col gap-4 overflow-hidden
            `}
          >
            {/* Place Details (if selected) */}
            {selectedPlace && (
              <div className="flex-shrink-0">
                <PlaceDetails place={selectedPlace} onClose={() => setSelectedPlace(null)} />
              </div>
            )}

            {/* Place List */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-y-auto custom-scrollbar">
              <PlaceList
                places={filteredPlaces}
                selectedPlaceId={selectedPlace?.id || null}
                onPlaceSelect={setSelectedPlace}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-2 right-2 text-xs text-gray-500 dark:text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            Mode: {displayMode || "unknown"} | Theme: {theme || "unknown"}
          </div>
        )}
      </div>
    </div>
  );
}
