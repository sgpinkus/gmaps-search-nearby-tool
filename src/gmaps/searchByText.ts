import { Loader } from '@googlemaps/js-api-loader';
export type CircleLiteral = google.maps.CircleLiteral;
import type { NewPlaceResult } from './utils';
export type { NewPlaceResult as PlaceSummary } from './utils';

export type SearchResult = {
  places: NewPlaceResult[],
  nextPageToken?: string,
}

/**
 * "new" API wrapper. Does not support paging.
 */
export async function searchByText(request: Omit<google.maps.places.SearchByTextRequest, 'fields'>, apiKey: string): Promise<SearchResult> {
  const loader = new Loader({
    apiKey,
    version: '3.58',
  });
  const PlacesLibrary: google.maps.PlacesLibrary = await loader.importLibrary('places');
  const defaults = {
    includedType: 'locality',
    fields: ['location', 'formattedAddress', 'types', 'id'],
  };
  const { places }: { places: any[] } = await PlacesLibrary.Place.searchByText({ ...defaults, ...request });
  return { places: (places || []).map(v => v['Eg']), nextPageToken: undefined };
}