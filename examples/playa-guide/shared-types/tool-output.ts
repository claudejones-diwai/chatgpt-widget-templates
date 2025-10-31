// Output schema for find_places tool
export interface Place {
  id: string;
  name: string;
  category: string; // "restaurant", "beach", "activity", "nightlife", "shopping", "hotel"
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number; // 1-5 stars
  priceLevel?: number; // 1-4 ($-$$$$)
  hours?: string;
  highlights?: string[]; // ["Beachfront", "Live Music", "Vegan Options"]

  // Enhanced fields for rich UI
  photos?: string[]; // Array of image URLs
  amenities?: string[]; // ["WiFi", "Parking", "Outdoor Seating", "Wheelchair Accessible"]
  openNow?: boolean; // Whether currently open
  priceRange?: string; // Human-readable: "$20-$40 per person"
  distance?: number; // Distance from user in km (calculated on frontend)
  popularItems?: string[]; // Popular dishes/activities
  bestTimeToVisit?: string; // "Quieter before 7pm", "Best at sunset"

  // Existing fields
  imageUrl?: string;
  website?: string;
  phone?: string;
}

export interface FindPlacesOutput {
  places: Place[];
  location: string;
  category: string;
  totalCount: number;
  centerCoordinates: {
    lat: number;
    lng: number;
  };
  error?: boolean;
  message?: string;
}
