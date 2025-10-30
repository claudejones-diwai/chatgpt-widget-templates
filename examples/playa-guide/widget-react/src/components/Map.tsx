// Map Component - Mapbox GL map with place markers
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { Place } from "../../../shared-types";
import { getCategoryColor } from "../utils/format";
import { fitMapToPlaces, createMarkerElement, getMapStyle } from "../utils/map-utils";
import type { Theme } from "../hooks";

interface MapProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  theme: Theme | null;
  centerCoordinates: { lat: number; lng: number };
}

export function Map({ places, selectedPlace, onPlaceSelect, theme, centerCoordinates }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("VITE_MAPBOX_ACCESS_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(theme),
      center: [centerCoordinates.lng, centerCoordinates.lat],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(getMapStyle(theme));
    }
  }, [theme]);

  // Update markers when places change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    // Add new markers
    places.forEach((place) => {
      const colors = getCategoryColor(place.category);
      const isSelected = selectedPlace?.id === place.id;
      const el = createMarkerElement(colors.marker, isSelected);

      el.addEventListener("click", () => {
        onPlaceSelect(place);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .addTo(map.current!);

      markers.current.set(place.id, marker);
    });

    // Fit map to show all places
    if (places.length > 0) {
      fitMapToPlaces(map.current, places);
    }
  }, [places, selectedPlace, onPlaceSelect]);

  // Center on selected place
  useEffect(() => {
    if (map.current && selectedPlace) {
      map.current.flyTo({
        center: [selectedPlace.coordinates.lng, selectedPlace.coordinates.lat],
        zoom: 15,
        duration: 1000,
      });

      // Update marker appearance
      markers.current.forEach((marker, id) => {
        const place = places.find((p) => p.id === id);
        if (place) {
          const colors = getCategoryColor(place.category);
          const isSelected = id === selectedPlace.id;
          const newEl = createMarkerElement(colors.marker, isSelected);
          newEl.addEventListener("click", () => {
            onPlaceSelect(place);
          });
          marker.setElement(newEl);
        }
      });
    }
  }, [selectedPlace]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
}
