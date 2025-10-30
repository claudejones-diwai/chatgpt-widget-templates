// Mapbox utility functions
import mapboxgl from "mapbox-gl";
import type { Place } from "../../../shared-types";

/**
 * Fit map bounds to show all places
 */
export function fitMapToPlaces(
  map: mapboxgl.Map,
  places: Place[],
  padding: number = 50
): void {
  if (places.length === 0) return;

  if (places.length === 1) {
    // Single place - center and zoom
    const place = places[0];
    map.flyTo({
      center: [place.coordinates.lng, place.coordinates.lat],
      zoom: 14,
      duration: 1000,
    });
    return;
  }

  // Multiple places - fit bounds
  const bounds = new mapboxgl.LngLatBounds();
  places.forEach((place) => {
    bounds.extend([place.coordinates.lng, place.coordinates.lat]);
  });

  map.fitBounds(bounds, {
    padding,
    duration: 1000,
    maxZoom: 15,
  });
}

/**
 * Create marker element with custom styling
 */
export function createMarkerElement(color: string, selected: boolean = false): HTMLElement {
  const el = document.createElement("div");
  el.className = `marker ${selected ? "marker-selected" : ""}`;
  el.style.cssText = `
    width: ${selected ? "40px" : "32px"};
    height: ${selected ? "40px" : "32px"};
    background-color: ${color};
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: all 0.2s ease;
  `;

  // Hover effect
  el.addEventListener("mouseenter", () => {
    if (!selected) {
      el.style.width = "36px";
      el.style.height = "36px";
      el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    }
  });

  el.addEventListener("mouseleave", () => {
    if (!selected) {
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    }
  });

  return el;
}

/**
 * Get map style URL based on theme
 */
export function getMapStyle(theme: "light" | "dark" | null): string {
  // Use Mapbox's built-in styles
  if (theme === "dark") {
    return "mapbox://styles/mapbox/dark-v11";
  }
  return "mapbox://styles/mapbox/light-v11";
}
