import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// Test mode: Mock window.openai for local development
const urlParams = new URLSearchParams(window.location.search);
const testMode = urlParams.get("test");

if (testMode && import.meta.env.DEV) {
  const testData = getTestData(testMode);
  const subscribers = new Set<() => void>();

  // Mock window.openai global for local testing
  (window as any).openai = {
    theme: urlParams.get("theme") || "light",
    displayMode: urlParams.get("mode") || "inline",
    maxHeight: 800,
    toolOutput: testData,
    widgetState: null,
    locale: "en-US",
    sendFollowUpMessage: async (options: { prompt: string }) => {
      alert(`Follow-up: ${options.prompt}`);
    },
    callTool: async (options: any) => {
      console.log("Call tool:", options);
    },
    subscribe: (callback: () => void) => {
      subscribers.add(callback);
      setTimeout(() => callback(), 0);
      return () => subscribers.delete(callback);
    },
  };
}

function getTestData(mode: string) {
  const baseCoords = { lat: 20.6296, lng: -87.0739 };

  switch (mode) {
    case "all":
      return {
        places: [
          {
            id: "rest-001",
            name: "Alux Restaurant",
            category: "restaurant",
            description: "Unique fine dining experience in a natural cave system with stunning stalactites and stalagmites. Serves international cuisine with Mexican influences.",
            address: "Avenida Juárez, Manzana 21, 77710 Playa del Carmen",
            coordinates: { lat: 20.6257, lng: -87.0725 },
            rating: 4.5,
            priceLevel: 4,
            hours: "6:00 PM - 12:00 AM",
            highlights: ["Cave Dining", "Fine Dining", "Romantic", "Unique Experience"],
            website: "https://www.aluxrestaurant.com",
          },
          {
            id: "beach-001",
            name: "Playa Mamitas",
            category: "beach",
            description: "Popular beach club with vibrant atmosphere, music, and beach activities. Great for socializing and water sports.",
            address: "Calle 28 Norte, Playa del Carmen",
            coordinates: { lat: 20.6318, lng: -87.0764 },
            rating: 4.4,
            priceLevel: 3,
            hours: "9:00 AM - 6:00 PM",
            highlights: ["Beach Club", "Water Sports", "Music", "Lively Atmosphere"],
          },
          {
            id: "activity-001",
            name: "Xcaret Park",
            category: "activity",
            description: "Eco-archaeological park with underground rivers, wildlife, beach, and evening cultural show.",
            address: "Carretera Chetumal-Puerto Juárez Km 282, Playa del Carmen",
            coordinates: { lat: 20.5791, lng: -87.1197 },
            rating: 4.8,
            priceLevel: 4,
            hours: "8:30 AM - 10:30 PM",
            highlights: ["Theme Park", "Underground Rivers", "Cultural Show", "Family-Friendly"],
            website: "https://www.xcaret.com",
          },
        ],
        location: "Playa del Carmen",
        category: "all",
        totalCount: 3,
        centerCoordinates: baseCoords,
      };

    case "restaurants":
      return {
        places: [
          {
            id: "rest-001",
            name: "Alux Restaurant",
            category: "restaurant",
            description: "Unique fine dining experience in a natural cave system.",
            address: "Avenida Juárez, Manzana 21, 77710 Playa del Carmen",
            coordinates: { lat: 20.6257, lng: -87.0725 },
            rating: 4.5,
            priceLevel: 4,
            highlights: ["Cave Dining", "Fine Dining", "Romantic"],
          },
          {
            id: "rest-002",
            name: "La Cueva del Chango",
            category: "restaurant",
            description: "Charming jungle-themed restaurant serving authentic Mexican breakfast and lunch in a garden setting.",
            address: "Calle 38 between 5th Ave and the beach",
            coordinates: { lat: 20.6336, lng: -87.0753 },
            rating: 4.7,
            priceLevel: 2,
            highlights: ["Mexican Cuisine", "Garden Setting", "Breakfast"],
          },
        ],
        location: "Playa del Carmen",
        category: "restaurants",
        totalCount: 2,
        centerCoordinates: baseCoords,
      };

    case "beaches":
      return {
        places: [
          {
            id: "beach-001",
            name: "Playa Mamitas",
            category: "beach",
            description: "Popular beach club with vibrant atmosphere.",
            address: "Calle 28 Norte, Playa del Carmen",
            coordinates: { lat: 20.6318, lng: -87.0764 },
            rating: 4.4,
            priceLevel: 3,
            highlights: ["Beach Club", "Water Sports", "Music"],
          },
          {
            id: "beach-002",
            name: "Playacar Beach",
            category: "beach",
            description: "Quieter, more upscale beach area with soft white sand and calm waters. Perfect for families.",
            address: "Playacar, Playa del Carmen",
            coordinates: { lat: 20.6175, lng: -87.0702 },
            rating: 4.7,
            priceLevel: 2,
            highlights: ["Family-Friendly", "Quiet", "White Sand", "Calm Waters"],
          },
        ],
        location: "Playa del Carmen",
        category: "beaches",
        totalCount: 2,
        centerCoordinates: baseCoords,
      };

    case "activities":
      return {
        places: [
          {
            id: "activity-001",
            name: "Xcaret Park",
            category: "activity",
            description: "Eco-archaeological park with underground rivers.",
            address: "Carretera Chetumal-Puerto Juárez Km 282",
            coordinates: { lat: 20.5791, lng: -87.1197 },
            rating: 4.8,
            priceLevel: 4,
            highlights: ["Theme Park", "Underground Rivers", "Cultural Show"],
          },
          {
            id: "activity-002",
            name: "Tulum Ruins",
            category: "activity",
            description: "Ancient Mayan ruins perched on cliffs overlooking the Caribbean Sea.",
            address: "Carretera Federal 307, Tulum",
            coordinates: { lat: 20.2145, lng: -87.4286 },
            rating: 4.6,
            priceLevel: 2,
            highlights: ["Mayan Ruins", "History", "Ocean Views"],
          },
        ],
        location: "Playa del Carmen",
        category: "activities",
        totalCount: 2,
        centerCoordinates: baseCoords,
      };

    case "error":
      return {
        places: [],
        location: "Mars",
        category: "all",
        totalCount: 0,
        centerCoordinates: baseCoords,
        error: true,
        message: "Sorry, this guide only covers Playa del Carmen. 'Mars' is not supported.",
      };

    default:
      return null;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
