export type NewPlaceResult = {
  location: google.maps.LatLngLiteral, // google.maps.places.SearchByTextRequest['location'] is a LatLng
  id: google.maps.places.Place['id'],
} & google.maps.places.PlaceResult;

/**
 * Rename some fields for convenience and make id mandatory because it is.
 */
export function placeResultToPlaceSummary(place: google.maps.places.PlaceResult): NewPlaceResult {
  const lat = place.geometry?.location?.lat() || 0;
  const lng = place.geometry?.location?.lng() || 0;
  return {
    ...place,
    location: { lat, lng },
    id: place.place_id!,
  };
}
