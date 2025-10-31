// Curated dataset of places in Playa del Carmen
// Real coordinates for actual locations
import { Place } from "../../../shared-types";

export const PLAYA_DEL_CARMEN_CENTER = {
  lat: 20.6296,
  lng: -87.0739,
};

export const PLACES: Place[] = [
  // RESTAURANTS
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
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", // Restaurant interior
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", // Fine dining plate
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", // Elegant restaurant
    ],
    amenities: ["Reservations Required", "Credit Cards", "Romantic Lighting", "Air Conditioning", "Bar", "Dress Code"],
    openNow: true,
    priceRange: "$40-$80 per person",
    popularItems: ["Grilled Octopus", "Beef Tenderloin", "Chocolate Lava Cake"],
    bestTimeToVisit: "Reserve for 7-8pm for best ambiance, avoid weekends if you prefer quieter dining",
    phone: "+52 984 206 2713",
  },
  {
    id: "rest-002",
    name: "La Cueva del Chango",
    category: "restaurant",
    description: "Charming jungle-themed restaurant serving authentic Mexican breakfast and lunch in a garden setting.",
    address: "Calle 38 between 5th Ave and the beach, Playa del Carmen",
    coordinates: { lat: 20.6336, lng: -87.0753 },
    rating: 4.7,
    priceLevel: 2,
    hours: "8:00 AM - 2:00 PM",
    highlights: ["Mexican Cuisine", "Garden Setting", "Breakfast", "Local Favorite"],
    photos: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", // Fresh food
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80", // Mexican breakfast
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", // Restaurant outdoor
    ],
    amenities: ["Outdoor Seating", "Cash Only", "Garden", "Fresh Juices", "Vegetarian Options"],
    openNow: false, // Closed (lunch only)
    priceRange: "$8-$15 per person",
    popularItems: ["Huevos Rancheros", "Fresh Juices", "Chilaquiles", "French Toast"],
    bestTimeToVisit: "Arrive before 9am to avoid wait, closes at 2pm",
    phone: "+52 984 147 0271",
  },
  {
    id: "rest-003",
    name: "El Fogón",
    category: "restaurant",
    description: "Beloved local taqueria serving some of the best al pastor tacos in town. Authentic street food experience.",
    address: "Calle 30 and Constituyentes Ave, Playa del Carmen",
    coordinates: { lat: 20.6188, lng: -87.0676 },
    rating: 4.8,
    priceLevel: 1,
    hours: "6:00 PM - 2:00 AM",
    highlights: ["Tacos", "Street Food", "Budget-Friendly", "Local Favorite"],
    photos: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80", // Tacos
      "https://images.unsplash.com/photo-1599974512764-134a32d48f7a?w=800&q=80", // Street tacos
      "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=800&q=80", // Taco close-up
    ],
    amenities: ["Outdoor Seating", "Cash Only", "Quick Service", "Late Night", "Takeout"],
    openNow: true,
    priceRange: "$1-$3 per taco",
    popularItems: ["Tacos al Pastor", "Grilled Onions", "Salsa Verde", "Handmade Tortillas"],
    bestTimeToVisit: "Best after 8pm when the pastor is perfectly cooked, expect lines but worth it",
    phone: "+52 984 803 1621",
  },
  {
    id: "rest-004",
    name: "Axiote",
    category: "restaurant",
    description: "Modern Mexican cuisine with creative cocktails in a stylish rooftop setting.",
    address: "5th Avenue between Calle 12 and 14, Playa del Carmen",
    coordinates: { lat: 20.6275, lng: -87.0744 },
    rating: 4.6,
    priceLevel: 3,
    hours: "5:00 PM - 11:00 PM",
    highlights: ["Rooftop", "Cocktails", "Modern Mexican", "Nightlife"],
    photos: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", // Rooftop restaurant
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80", // Cocktails
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", // Modern dining
    ],
    amenities: ["Rooftop Seating", "Bar", "Reservations", "Credit Cards", "Romantic", "Groups"],
    openNow: true,
    priceRange: "$25-$50 per person",
    popularItems: ["Mezcal Cocktails", "Pork Belly Tacos", "Guacamole", "Churros"],
    bestTimeToVisit: "Reserve for sunset (6-7pm), great for drinks before dinner elsewhere",
    phone: "+52 984 803 5748",
  },
  {
    id: "rest-005",
    name: "Kaxapa Factory",
    category: "restaurant",
    description: "Venezuelan arepas and cachapas in a casual, colorful setting. Great vegetarian options.",
    address: "Calle 28 Norte between 5th and 10th Ave, Playa del Carmen",
    coordinates: { lat: 20.6304, lng: -87.0739 },
    rating: 4.5,
    priceLevel: 2,
    hours: "8:00 AM - 10:00 PM",
    highlights: ["Venezuelan", "Vegetarian Friendly", "Casual", "Quick Service"],
    photos: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80", // Arepas
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", // Healthy food
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", // Fresh salad
    ],
    amenities: ["Vegetarian Options", "Vegan Options", "Outdoor Seating", "Casual", "Takeout", "Quick Service"],
    openNow: true,
    priceRange: "$6-$12 per person",
    popularItems: ["Reina Pepiada Arepa", "Pabellon Arepa", "Cachapa with Cheese"],
    bestTimeToVisit: "Great for breakfast or lunch, less crowded before noon",
    phone: "+52 984 803 5023",
    website: "https://www.kaxapafactory.com",
  },

  // BEACHES
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
    photos: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80", // Beach club
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Caribbean beach
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80", // Beach activities
    ],
    amenities: ["Beach Chairs", "Umbrellas", "Showers", "Lockers", "Bar", "Restaurant", "Water Sports Rentals", "WiFi"],
    openNow: true,
    priceRange: "$20-$40 per person (includes chair & umbrella)",
    popularItems: ["Day Pass", "Ceviche", "Frozen Margaritas", "Paddle Board Rental"],
    bestTimeToVisit: "Arrive before 11am for best spot selection, liveliest 1-4pm",
    phone: "+52 984 803 2867",
  },
  {
    id: "beach-002",
    name: "Playacar Beach",
    category: "beach",
    description: "Quieter, more upscale beach area with soft white sand and calm waters. Perfect for families and relaxation.",
    address: "Playacar, Playa del Carmen",
    coordinates: { lat: 20.6175, lng: -87.0702 },
    rating: 4.7,
    priceLevel: 2,
    hours: "Sunrise - Sunset",
    highlights: ["Family-Friendly", "Quiet", "White Sand", "Calm Waters"],
    photos: [
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80", // Quiet beach
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80", // Tropical beach
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Caribbean water
    ],
    amenities: ["Free Access", "Shade Areas", "Calm Waters", "Family Friendly", "Nearby Restaurants"],
    openNow: true,
    priceRange: "Free (public beach)",
    popularItems: ["Swimming", "Sunbathing", "Beach Walks", "Snorkeling"],
    bestTimeToVisit: "Morning for calmest water, less crowded than main beaches",
    phone: "N/A",
  },
  {
    id: "beach-003",
    name: "Punta Esmeralda",
    category: "beach",
    description: "Hidden gem beach where a cenote meets the ocean. Free public beach with unique swimming experience.",
    address: "Calle 40 Norte, Playa del Carmen",
    coordinates: { lat: 20.6405, lng: -87.0779 },
    rating: 4.6,
    priceLevel: 1,
    hours: "Sunrise - Sunset",
    highlights: ["Cenote", "Free Beach", "Unique", "Natural Beauty"],
    photos: [
      "https://images.unsplash.com/photo-1520605993444-a58f0c1b9d72?w=800&q=80", // Hidden beach
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // Cenote
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80", // Beach nature
    ],
    amenities: ["Free Access", "Cenote Swimming", "Natural Setting", "Snorkeling", "No Facilities"],
    openNow: true,
    priceRange: "Free",
    popularItems: ["Cenote Swimming", "Exploring", "Photography"],
    bestTimeToVisit: "Arrive early for best experience, bring snacks & water (no vendors)",
    phone: "N/A",
  },
  {
    id: "beach-004",
    name: "Xpu-Há Beach",
    category: "beach",
    description: "Stunning beach with crystal-clear turquoise water, located 30 minutes south. Perfect for snorkeling.",
    address: "Carretera Federal 307 Km 265, Puerto Aventuras",
    coordinates: { lat: 20.4654, lng: -87.1234 },
    rating: 4.8,
    priceLevel: 2,
    hours: "8:00 AM - 6:00 PM",
    highlights: ["Snorkeling", "Crystal Clear Water", "Scenic", "Day Trip"],
    photos: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // Clear water beach
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80", // Snorkeling
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Caribbean beach
    ],
    amenities: ["Parking", "Beach Clubs", "Snorkel Gear Rental", "Restaurants", "Calm Waters"],
    openNow: true,
    priceRange: "$5-$10 parking, $20-$30 beach club access",
    popularItems: ["Snorkeling", "Swimming", "Beach Relaxation"],
    bestTimeToVisit: "Go early (before 11am) to avoid crowds, 30min drive south of PDC",
    phone: "+52 984 873 2194",
  },

  // ACTIVITIES
  {
    id: "activity-001",
    name: "Gran Cenote",
    category: "activity",
    description: "Beautiful cenote near Tulum perfect for swimming and snorkeling. Clear waters with fish and turtles.",
    address: "Carretera Tulum-Cobá Km 4, Tulum",
    coordinates: { lat: 20.2381, lng: -87.4629 },
    rating: 4.7,
    priceLevel: 2,
    hours: "8:00 AM - 5:00 PM",
    highlights: ["Cenote", "Snorkeling", "Swimming", "Nature"],
    photos: [
      "https://images.unsplash.com/photo-1564783384688-42d1e6063e26?w=800&q=80", // Cenote
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // Clear water
      "https://images.unsplash.com/photo-1570541375773-49e679ec0a40?w=800&q=80", // Cave diving
    ],
    amenities: ["Snorkel Gear Rental", "Lockers", "Bathrooms", "Life Jackets", "Parking"],
    openNow: true,
    priceRange: "$15-$20 entrance + gear rental",
    popularItems: ["Snorkeling", "Swimming", "Cave Photography"],
    bestTimeToVisit: "Arrive at opening (8am) for clearest water, 45min from Playa",
    phone: "+52 984 114 0003",
    website: "https://www.grancenote.com",
  },
  {
    id: "activity-002",
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
  {
    id: "activity-003",
    name: "Cozumel Snorkeling",
    category: "activity",
    description: "Day trip to Cozumel for world-class snorkeling and diving on the Mesoamerican Reef.",
    address: "Ferry from Playa del Carmen to Cozumel",
    coordinates: { lat: 20.5083, lng: -86.9458 },
    rating: 4.9,
    priceLevel: 3,
    highlights: ["Snorkeling", "Day Trip", "Coral Reef", "Ferry Ride"],
  },
  {
    id: "activity-004",
    name: "Tulum Ruins",
    category: "activity",
    description: "Ancient Mayan ruins perched on cliffs overlooking the Caribbean Sea. Stunning views and history.",
    address: "Carretera Federal 307, Tulum",
    coordinates: { lat: 20.2145, lng: -87.4286 },
    rating: 4.6,
    priceLevel: 2,
    hours: "8:00 AM - 5:00 PM",
    highlights: ["Mayan Ruins", "History", "Ocean Views", "UNESCO Site"],
  },
  {
    id: "activity-005",
    name: "Rio Secreto",
    category: "activity",
    description: "Underground river exploration through stunning cave system with crystal formations.",
    address: "Carretera Federal 307, Km 283.5, Playa del Carmen",
    coordinates: { lat: 20.5519, lng: -87.1091 },
    rating: 4.8,
    priceLevel: 4,
    hours: "9:00 AM - 5:00 PM",
    highlights: ["Cave System", "Underground River", "Unique Experience", "Guided Tours"],
    website: "https://www.riosecreto.com.mx",
  },
  {
    id: "activity-006",
    name: "Zip-lining at Xplor",
    category: "activity",
    description: "Adventure park with zip-lines, underground rafting, and amphibious vehicles through jungle.",
    address: "Carretera Chetumal - Puerto Juárez Km 282, Playa del Carmen",
    coordinates: { lat: 20.5772, lng: -87.1178 },
    rating: 4.7,
    priceLevel: 4,
    hours: "9:00 AM - 5:00 PM",
    highlights: ["Zip-lining", "Adventure", "Underground Rivers", "Family-Friendly"],
  },

  // NIGHTLIFE
  {
    id: "night-001",
    name: "Coco Bongo",
    category: "nightlife",
    description: "World-famous nightclub with live performances, acrobatics, and impersonator shows. No dance floor - all seats.",
    address: "Avenida 10 and Calle 12, Playa del Carmen",
    coordinates: { lat: 20.6268, lng: -87.0733 },
    rating: 4.5,
    priceLevel: 4,
    hours: "10:30 PM - 3:30 AM",
    highlights: ["Nightclub", "Live Shows", "Acrobatics", "Open Bar"],
    website: "https://www.cocobongo.com",
  },
  {
    id: "night-002",
    name: "Palazzo Nightclub",
    category: "nightlife",
    description: "Upscale nightclub on 5th Avenue with international DJs and modern music. VIP tables available.",
    address: "5th Avenue between Calle 12 and 14, Playa del Carmen",
    coordinates: { lat: 20.6273, lng: -87.0745 },
    rating: 4.3,
    priceLevel: 4,
    hours: "10:00 PM - 5:00 AM",
    highlights: ["Nightclub", "DJ", "Dancing", "VIP Service"],
  },
  {
    id: "night-003",
    name: "Santino Beach Club",
    category: "nightlife",
    description: "Beach club that transforms into party venue at night with electronic music and fire shows.",
    address: "Calle 10 Norte, Playa del Carmen",
    coordinates: { lat: 20.6263, lng: -87.0757 },
    rating: 4.4,
    priceLevel: 3,
    hours: "10:00 AM - 3:00 AM",
    highlights: ["Beach Club", "Electronic Music", "Fire Shows", "Beachfront"],
  },

  // SHOPPING
  {
    id: "shop-001",
    name: "5th Avenue (Quinta Avenida)",
    category: "shopping",
    description: "Main pedestrian shopping street with boutiques, souvenir shops, restaurants, and street performers.",
    address: "5th Avenue, Playa del Carmen",
    coordinates: { lat: 20.6285, lng: -87.0749 },
    rating: 4.5,
    priceLevel: 2,
    hours: "9:00 AM - 11:00 PM",
    highlights: ["Pedestrian Street", "Shopping", "Dining", "Entertainment"],
  },
  {
    id: "shop-002",
    name: "Paseo del Carmen",
    category: "shopping",
    description: "Modern outdoor shopping mall with international brands, cinema, and restaurants.",
    address: "5th Avenue and Constituyentes Ave, Playa del Carmen",
    coordinates: { lat: 20.6206, lng: -87.0696 },
    rating: 4.3,
    priceLevel: 3,
    hours: "10:00 AM - 10:00 PM",
    highlights: ["Shopping Mall", "Cinema", "International Brands", "Air Conditioned"],
  },

  // HOTELS
  {
    id: "hotel-001",
    name: "Grand Hyatt Playa del Carmen",
    category: "hotel",
    description: "Luxury beachfront resort with multiple pools, spa, and gourmet restaurants.",
    address: "Avenida Constituyentes Mza. 34, Playa del Carmen",
    coordinates: { lat: 20.6235, lng: -87.0718 },
    rating: 4.7,
    priceLevel: 4,
    highlights: ["Luxury", "Beachfront", "Spa", "Multiple Restaurants"],
    website: "https://www.hyatt.com",
  },
  {
    id: "hotel-002",
    name: "Thompson Playa del Carmen",
    category: "hotel",
    description: "Adults-only boutique hotel with rooftop pool and beach club. Modern and stylish.",
    address: "5th Avenue between Calle 12 and 14, Playa del Carmen",
    coordinates: { lat: 20.6274, lng: -87.0744 },
    rating: 4.6,
    priceLevel: 4,
    highlights: ["Adults Only", "Rooftop Pool", "Beach Club", "Boutique"],
  },
  {
    id: "hotel-003",
    name: "Mahekal Beach Resort",
    category: "hotel",
    description: "Beachfront eco-resort with palapa-style rooms, multiple pools, and lush gardens.",
    address: "Calle 38 Nte, Playa del Carmen",
    coordinates: { lat: 20.6339, lng: -87.0755 },
    rating: 4.5,
    priceLevel: 3,
    highlights: ["Eco-Resort", "Beachfront", "Gardens", "Palapa Rooms"],
    website: "https://www.mahekalresort.com",
  },
  {
    id: "hotel-004",
    name: "Hotel Xcaret Mexico",
    category: "hotel",
    description: "All-inclusive resort with access to all Xcaret parks. Eco-integrated luxury experience.",
    address: "Carretera Chetumal - Puerto Juárez Km 282, Playa del Carmen",
    coordinates: { lat: 20.5799, lng: -87.1203 },
    rating: 4.9,
    priceLevel: 4,
    highlights: ["All-Inclusive", "Park Access", "Luxury", "Family-Friendly"],
    website: "https://www.hotelxcaret.com",
  },

  // ADDITIONAL ACTIVITIES
  {
    id: "activity-007",
    name: "Cenote Dos Ojos",
    category: "activity",
    description: "One of the world's most famous cenotes for diving and snorkeling. Crystal-clear water with two connected cenotes.",
    address: "Carretera Federal Tulum-Cobá, Tulum",
    coordinates: { lat: 20.3154, lng: -87.3542 },
    rating: 4.7,
    priceLevel: 2,
    hours: "8:00 AM - 5:00 PM",
    highlights: ["Cenote", "Diving", "Snorkeling", "Crystal Clear"],
  },
  {
    id: "activity-008",
    name: "Sian Ka'an Biosphere",
    category: "activity",
    description: "UNESCO World Heritage site with pristine nature, mangroves, and wildlife. Eco-tours available.",
    address: "Carretera Tulum-Punta Allen, Tulum",
    coordinates: { lat: 19.9333, lng: -87.6333 },
    rating: 4.8,
    priceLevel: 3,
    highlights: ["UNESCO Site", "Nature Reserve", "Eco-Tours", "Wildlife"],
  },
];

// Helper function to filter places by category
export function getPlacesByCategory(category: string, limit: number = 10): Place[] {
  if (category === "all") {
    return PLACES.slice(0, limit);
  }
  return PLACES.filter((place) => place.category === category).slice(0, limit);
}

// Helper function to get places by preference keywords
export function getPlacesByPreference(
  preferences: string,
  category?: string,
  limit: number = 10
): Place[] {
  const keywords = preferences.toLowerCase().split(" ");
  let filtered = category && category !== "all"
    ? PLACES.filter((place) => place.category === category)
    : PLACES;

  // Filter by preferences matching highlights or description
  filtered = filtered.filter((place) => {
    const searchText = [
      place.description,
      ...(place.highlights || []),
    ].join(" ").toLowerCase();

    return keywords.some((keyword) => searchText.includes(keyword));
  });

  return filtered.slice(0, limit);
}
