// Persistent right sidebar with collapse/expand
import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { Place } from "../../../shared-types";
import PlaceCard from "./PlaceCard";

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
                <PlaceCard
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
