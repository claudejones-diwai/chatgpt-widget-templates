// Input schema for find_places tool
export interface FindPlacesInput {
  location: string; // "Playa del Carmen"
  category?: string; // "restaurants" | "beaches" | "activities" | "nightlife" | "shopping" | "hotels" | "all"
  preferences?: string; // User preferences (e.g., "family-friendly", "romantic", "budget")
  limit?: number; // Max number of places (default: 10, max: 50)
}
