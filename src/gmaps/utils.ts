export type NewPlaceResult = {
  location: google.maps.LatLngLiteral, // google.maps.places.SearchByTextRequest['location'] is a LatLng
  id: google.maps.places.Place['id'],
} & google.maps.places.PlaceResult;

export function placeResultToPlaceSummary(place: google.maps.places.PlaceResult): NewPlaceResult {
  const location = googleMapLatLngToLatLngLiteral(place?.geometry?.location);
  return {
    ...place,
    location,
    id: place.place_id!,
  };
}

/**
 * PlaceResult.geometry.location (and other places) uses `google.maps.LatLng`
 * where lat, lng are function for some bizarre Google reason.
 */
export function googleMapLatLngToLatLngLiteral(location: any) {
  const lat = location?.lat() || 0;
  const lng = location?.lng() || 0;
  return { lat, lng };
}
