// find_places tool implementation
import { FindPlacesInput, FindPlacesOutput } from "../../../shared-types";
import {
  PLACES,
  PLAYA_DEL_CARMEN_CENTER,
  getPlacesByCategory,
  getPlacesByPreference,
} from "../data/playa-places";

export async function handleFindPlaces(
  args: Partial<FindPlacesInput>
): Promise<FindPlacesOutput> {
  try {
    // Validate location (currently only supports Playa del Carmen)
    const location = args.location || "Playa del Carmen";
    if (!location.toLowerCase().includes("playa")) {
      return {
        places: [],
        location,
        category: args.category || "all",
        totalCount: 0,
        centerCoordinates: PLAYA_DEL_CARMEN_CENTER,
        error: true,
        message: `Sorry, this guide only covers Playa del Carmen. "${location}" is not supported yet.`,
      };
    }

    // Get parameters
    const category = args.category?.toLowerCase() || "all";
    const preferences = args.preferences || "";
    const limit = Math.min(args.limit || 10, 50); // Max 50 places

    // Filter places by category ONLY (ignore preferences for now to return all results)
    let filteredPlaces = getPlacesByCategory(category, limit);

    // If no results and category was specified, fallback to all categories
    if (filteredPlaces.length === 0 && category !== "all") {
      filteredPlaces = PLACES.slice(0, limit);
    }

    return {
      places: filteredPlaces,
      location: "Playa del Carmen",
      category,
      totalCount: filteredPlaces.length,
      centerCoordinates: PLAYA_DEL_CARMEN_CENTER,
    };
  } catch (error) {
    console.error("Error in handleFindPlaces:", error);
    return {
      places: [],
      location: args.location || "Playa del Carmen",
      category: args.category || "all",
      totalCount: 0,
      centerCoordinates: PLAYA_DEL_CARMEN_CENTER,
      error: true,
      message: `Failed to find places: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
