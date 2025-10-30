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
    highlights: ["Venezuelan", "Vegetarian Friendly", "Casual", "Quick Service"],
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
    highlights: ["Family-Friendly", "Quiet", "White Sand", "Calm Waters"],
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
    highlights: ["Cenote", "Free Beach", "Unique", "Natural Beauty"],
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
    highlights: ["Snorkeling", "Crystal Clear Water", "Scenic", "Day Trip"],
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
