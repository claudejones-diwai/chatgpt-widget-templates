// Main App Component - Pattern from Pizzaz example
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useTheme, useDisplayMode, useMaxHeight, useToolData } from "./hooks";
import { Sidebar } from "./components";
import { PlaceDetails } from "./components/PlaceDetails";
import type { FindPlacesOutput, Place } from "../../shared-types";

// Mapbox access token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Category icon mapping - using Lucide icon SVG paths
const getCategoryIcon = (category: string): string => {
  const iconSize = 14;
  const strokeWidth = 2;

  switch (category.toLowerCase()) {
    case 'restaurant':
      // Utensils icon
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
    case 'beach':
      // Waves icon
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
    case 'activity':
      // Zap/Activity icon
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/></svg>`;
    case 'nightlife':
      // Wine glass icon
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/></svg>`;
    case 'cultural':
      // Landmark icon
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;
    case 'shopping':
      // Shopping bag icon
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
    default:
      // Map pin icon for unknown categories
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/></svg>`;
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Helper function to fit map to markers
function fitMapToMarkers(map: mapboxgl.Map, coords: [number, number][]) {
  if (!map || !coords.length) return;
  if (coords.length === 1) {
    map.flyTo({ center: coords[0], zoom: 12 });
    return;
  }
  const bounds = coords.reduce(
    (b, c) => b.extend(c),
    new mapboxgl.LngLatBounds(coords[0], coords[0])
  );
  map.fitBounds(bounds, { padding: 60, animate: true });
}

export default function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<mapboxgl.Map | null>(null);
  const markerObjs = useRef<mapboxgl.Marker[]>([]);

  const theme = useTheme();
  const displayMode = useDisplayMode();
  const maxHeight = useMaxHeight() ?? undefined;
  const toolData = useToolData<FindPlacesOutput>();

  const navigate = useNavigate();
  const location = useLocation();

  // User location state
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation not available:', error.message);
          // Silently fail - distance feature just won't be available
        }
      );
    }
  }, []);

  // Get selected place from route
  const selectedId = React.useMemo(() => {
    const match = location?.pathname?.match(/(?:^|\/)place\/([^/]+)/);
    return match && match[1] ? match[1] : null;
  }, [location?.pathname]);

  // Handle data - render empty UI if no data yet (production)
  // In development with ?test param, window.openai is mocked so toolData is always available
  const rawPlaces = toolData?.places || [];

  // Calculate distances and enrich places with distance data
  const places = React.useMemo(() => {
    if (!userLocation) return rawPlaces;

    return rawPlaces.map((place) => ({
      ...place,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.coordinates.lat,
        place.coordinates.lng
      ),
    }));
  }, [rawPlaces, userLocation]);

  const selectedPlace = places.find((p) => p.id === selectedId) || null;
  const markerCoords = places.map((p) => [p.coordinates.lng, p.coordinates.lat] as [number, number]);

  // Initialize map - EXACT Pizzaz pattern
  useEffect(() => {
    if (mapObj.current) return;
    if (!mapRef.current || !MAPBOX_TOKEN) return;

    mapObj.current = new mapboxgl.Map({
      container: mapRef.current,
      style: theme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12",
      center: markerCoords.length > 0 ? markerCoords[0] : [-87.0739, 20.6296],
      zoom: markerCoords.length > 0 ? 12 : 2,
      attributionControl: false,
    });

    // Pizzaz: addAllMarkers called HERE during initialization
    addAllMarkers(places);

    setTimeout(() => {
      if (mapObj.current && markerCoords.length > 0) {
        fitMapToMarkers(mapObj.current, markerCoords);
      }
    }, 0);

    // After first paint
    requestAnimationFrame(() => mapObj.current?.resize());

    // Keep in sync with window resizes
    const handleResize = () => mapObj.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mapObj.current) {
        mapObj.current.remove();
      }
      mapObj.current = null;
    };
    // eslint-disable-next-line
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapObj.current) return;
    const newStyle = theme === "dark"
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";
    mapObj.current.setStyle(newStyle);
  }, [theme]);

  // Update markers when places or selection changes
  useEffect(() => {
    if (!mapObj.current) return;
    addAllMarkers(places);

    // Fit map to markers when data arrives (but not on selection change)
    if (places.length > 0 && !selectedId) {
      const coords = places.map((p) => [p.coordinates.lng, p.coordinates.lat] as [number, number]);
      setTimeout(() => {
        if (mapObj.current) {
          fitMapToMarkers(mapObj.current, coords);
        }
      }, 100);
    }
    // eslint-disable-next-line
  }, [places, selectedId]); // Re-run when selection changes

  // Function to add all markers
  function addAllMarkers(placesList: Place[]) {
    if (!mapObj.current) return;

    markerObjs.current.forEach((m) => m.remove());
    markerObjs.current = [];

    placesList.forEach((place) => {
      if (!mapObj.current) return;

      // Create custom marker element
      const el = document.createElement('div');
      const isSelected = place.id === selectedId;
      const categoryIcon = getCategoryIcon(place.category);

      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="marker-pin ${isSelected ? 'selected' : ''}" style="
          width: ${isSelected ? '44px' : '32px'};
          height: ${isSelected ? '44px' : '32px'};
          background: ${isSelected ? 'linear-gradient(135deg, #DC2626 0%, #F46C21 100%)' : '#F46C21'};
          border: ${isSelected ? '4px' : '2px'} solid ${isSelected ? '#FFF' : 'white'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg) ${isSelected ? 'scale(1.2)' : ''};
          box-shadow: ${isSelected ? '0 8px 16px rgba(220, 38, 38, 0.4), 0 0 0 4px rgba(220, 38, 38, 0.1)' : '0 2px 6px rgba(0,0,0,0.2)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          z-index: ${isSelected ? '1000' : '1'};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: ${isSelected ? '6px' : '4px'};
          ">
            ${categoryIcon}
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .addTo(mapObj.current);

      el.style.cursor = "pointer";
      // Use setTimeout to defer navigate() call out of render cycle
      el.addEventListener("click", () => {
        setTimeout(() => {
          navigate(`/place/${place.id}`);
          panTo([place.coordinates.lng, place.coordinates.lat]);
        }, 0);
      });

      markerObjs.current.push(marker);
    });
  }

  // Pan to coordinates
  function panTo(coord: [number, number]) {
    if (!mapObj.current) return;

    // Use padding to ensure marker is visible and not hidden behind sidebar
    // Sidebar is 420px wide, so add right padding to keep markers in visible area
    const flyOpts: any = {
      center: coord,
      zoom: 14,
      speed: 1.2,
      curve: 1.6,
      padding: { right: 430, left: 20, top: 20, bottom: 20 }, // Extra 10px for margin
    };

    mapObj.current.flyTo(flyOpts);
  }

  // Pan when selected place changes
  useEffect(() => {
    if (!mapObj.current || !selectedPlace) return;
    panTo([selectedPlace.coordinates.lng, selectedPlace.coordinates.lat]);
  }, [selectedId]);

  // Resize map when maxHeight or displayMode changes
  useEffect(() => {
    if (!mapObj.current) return;
    mapObj.current.resize();
  }, [maxHeight, displayMode]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div
        style={{
          maxHeight,
          height: displayMode === "fullscreen" ? maxHeight ? maxHeight - 40 : undefined : 480,
        }}
        className={
          "relative antialiased w-full min-h-[480px] overflow-hidden bg-gray-50 dark:bg-gray-900 " +
          (displayMode === "fullscreen"
            ? "rounded-none border-0"
            : "border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl")
        }
      >
        <Outlet />

        {/* Sidebar with carousel */}
        <Sidebar
          places={places}
          selectedId={selectedId}
          onSelect={(place) => {
            navigate(`/place/${place.id}`);
            panTo([place.coordinates.lng, place.coordinates.lat]);
          }}
        />

        {/* Inspector (place details) */}
        <AnimatePresence>
          {displayMode === "fullscreen" && selectedPlace && (
            <div className="playa-inspector">
              <PlaceDetails
                key={selectedPlace.id}
                place={selectedPlace}
                onClose={() => navigate("..")}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Map */}
        <div
          className={
            "absolute inset-0 overflow-hidden" +
            (displayMode === "fullscreen"
              ? " left-2 right-2 top-2 bottom-4 border border-gray-200 dark:border-gray-700 rounded-3xl"
              : "")
          }
        >
          <div
            ref={mapRef}
            className="w-full h-full absolute bottom-0 left-0 right-0"
            style={{
              maxHeight,
              height: displayMode === "fullscreen" ? maxHeight : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
