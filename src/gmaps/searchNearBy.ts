// / <reference types="@types/google.maps" />
/**
 * Thin wrapper over places API. There is actually two places APIs available. One with two functions searchByText, searchNearBy
 * and no pagination which makes it basically useless for us (I think this is called the 'new' API) -- [1], [2] and one
 * that looks more like the API you get from the NodeJS package [3]. Using that one.
 * [1]: https://developers.google.com/maps/documentation/javascript/reference/place
 * [2]: https://developers.google.com/maps/documentation/javascript/nearby-search
 * [3]: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlacesService
 */
import { type LatLngLiteral } from 'leaflet';
import { Loader } from '@googlemaps/js-api-loader';
import { type NewPlaceResult, placeResultToPlaceSummary } from './utils';
export { type NewPlaceResult as NewPlaceResult } from './utils';

export type MySearchNearbyRequest = {
  location: LatLngLiteral,
  radius: number,
  type?: string,
  rankBy?: google.maps.places.PlaceSearchRequest['rankBy'],
}

export type EventDetail = {
  places: NewPlaceResult[],
  status: google.maps.places.PlacesServiceStatus,
}

export type MyGetDetailsResponse = {
  place: google.maps.places.PlaceResult | null,
  status: google.maps.places.PlacesServiceStatus
};

export class SearchNearByService {
  lastPage: NewPlaceResult[] = []; // derived from actual result google.maps.places.PlaceResult
  private listeners = new EventTarget();
  status?: google.maps.places.PlacesServiceStatus;
  nextPageHandle?: google.maps.places.PlaceSearchPagination;
  working: boolean = false;

  private constructor(public readonly service: google.maps.places.PlacesService) { }

  static async create(apiKey: string) {
    const loader = new Loader({
      apiKey,
      version: '3.58',
    });
    const lib: google.maps.PlacesLibrary = await loader.importLibrary('places');
    const service = new lib.PlacesService(window.document.createElement('div'));
    return new this(service);
  }

  /**
   * You can't specify which fields you wnat here even for a subset -- google.maps.places.PlaceSearchRequest doesn't
   * have a `fields` field. @see service.getDetails.
   */
  async start(request: MySearchNearbyRequest) {
    this.service.nearbySearch({ ...request }, (...args) => this.myCallBack(...args));
  }

  myCallBack(
    places: google.maps.places.PlaceResult[] | null,
    status: google.maps.places.PlacesServiceStatus,
    nextPageHandle: google.maps.places.PlaceSearchPagination | null,
  ) {
    console.debug(`SearchNearByService: results=${places?.length || 0}, status=${status}`);
    this.status = status;
    this.nextPageHandle = nextPageHandle || undefined;
    if (status === 'OK') {
      // This just adds derived values id, and location to PlaceResult.
      this.lastPage = (places || []).map(v => placeResultToPlaceSummary(v));
    }
    this.listeners.dispatchEvent(new CustomEvent<EventDetail>('next-page', { detail: { places: this.lastPage || [], status } }));
  }

  get hasNextPage() {
    return this.nextPageHandle ? this.nextPageHandle.hasNextPage : false;
  }

  /**
   *
   * @returns Even if the next page handle returned is not null. If it says it has no next page calling it does nothing
   */
  nextPage() {
    if (!this.nextPageHandle) throw new Error('Cant request next page because API returned a null next-page handle');
    if (this.nextPageHandle.hasNextPage) {
      this.nextPageHandle?.nextPage();
    }
  }

  addEventListener(name: 'next-page', f: (evt: CustomEvent<EventDetail>) => void) {
    this.listeners.addEventListener(name, f as (evt: Event) => void);
  }

  removeEventListener(name: 'next-page', f: (evt: CustomEvent<EventDetail>) => void) {
    this.listeners.removeEventListener(name, f as (evt: Event) => void);
  }

  /**
   * Meh, Tack this on here ...
   */
  getDetails(id: string, fields: (keyof google.maps.places.PlaceResult)[]): Promise<MyGetDetailsResponse> {
    return new Promise((resolve) => {
      const cb = (
        place: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus,
      ) => {
        resolve({ place, status });
      };
      this.service.getDetails({ placeId: id, fields }, cb);
    });
  }
}

