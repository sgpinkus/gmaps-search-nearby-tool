import { Loader } from '@googlemaps/js-api-loader';
export type CircleLiteral = google.maps.CircleLiteral;

export type SearchResult = {
  places: google.maps.places.Place[],
  nextPageToken?: string,
}

// type MyPlace = Omit<google.maps.places.Place, 'location'> & { location: google.maps.LatLngLiteral };

/**
 * "new" API wrapper. Does not support paging.
 */
export async function searchByText(request: Omit<google.maps.places.SearchByTextRequest, 'fields'>, apiKey: string): Promise<SearchResult> {
  const loader = new Loader({
    apiKey,
    version: '3.64',
  });
  const PlacesLibrary: google.maps.PlacesLibrary = await loader.importLibrary('places');
  const defaults = {
    includedType: 'locality',
    fields: ['location', 'formattedAddress', 'types', 'id'],
  };
  const { places } = await PlacesLibrary.Place.searchByText({ ...defaults, ...request });

  return {
    places,
    nextPageToken: undefined,
  };
}