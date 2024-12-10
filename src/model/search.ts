// / <reference types="@types/google.maps" />
import { reactive } from 'vue';
import { v4 as uuid } from 'uuid';
import { SearchNearByService, type EventDetail, type MyGetDetailsResponse, type MySearchNearbyRequest, type NewPlaceResult } from '@/gmaps/searchNearBy';
import store from './index'; // Cyclic dependencies FTW.
import { cloneDeep } from 'lodash';

export interface ISearch {
  id: string,
  query?: MySearchNearbyRequest,
  nextPageToken?: string,
  createdAt: Date,
  startedAt?: Date,
  lastPageAt?: Date,
  results: NewPlaceResult[],
}

/**
 * Wrapper over SearchService which is like a cursor over a fixed query.
 * @see SearchService
 */
export default class Search implements ISearch {
  results: NewPlaceResult[] = [];
  status: google.maps.places.PlacesServiceStatus | 'NOT_STARTED' | 'FINISHED' = 'NOT_STARTED';
  hasNextPage: boolean = false;
  pager?: SearchNearByService;
  nextPageToken?: string;
  createdAt: Date;
  startedAt?: Date;
  lastPageAt?: Date;
  resultsPerRun: number = 20;
  readonly: boolean = false; // This happens when the object is re-hydrated because SearchNearByService is not serializable.
  deleted: boolean = false;
  static PlaceDetailFields: (keyof google.maps.places.PlaceResult)[] = [
    'types',
    'name',
    'formatted_address',
    'formatted_phone_number',
    'international_phone_number',
    'business_status',
    'website',
    'url',
    'icon',
    'photos',
  ];

  /**
   * Query is immutable from search creation because all next pages are linked to the same query. TODO: That's not technically
   * the case for apiKey ...
   */
  constructor(
    public readonly apiKey: string,
    public readonly query: MySearchNearbyRequest,
    public readonly id: string = uuid()) {
    this.createdAt = new Date();
  }

  get title(): string {
    return String(this.startedAt);
  }

  get started() {
    return !!this.startedAt;
  }

  async start() {
    this.validateStartConditions();
    this.startedAt = new Date();
    this.pager = await SearchNearByService.create(this.apiKey);
    this.pager.addEventListener('next-page', (evt: CustomEvent<EventDetail>) => { reactive(this).onNextPage(evt); });
    this.pager.start(this.query);
  }

  onNextPage(evt: CustomEvent<EventDetail>) {
    const { places, status } = evt.detail;
    for (const place of places) {
      if (store.placeCache[place.id]) {
        this.results.push({ ...place, ...cloneDeep(store.placeCache[place.id]) });
      } else {
        this.pager?.getDetails(place.id, Search.PlaceDetailFields).then(({ place: placeDetails }: MyGetDetailsResponse) => {
          this.results.push({ ...place, ...placeDetails });
          store.placeCache[place.id] = { ...place, ...placeDetails };
        });
      }
    }
    this.status = (status === 'OK' && !this.hasNextPage) ? 'FINISHED' : status;
    this.hasNextPage = this.pager ? this.pager.hasNextPage : false;
  }

  nextPage() {
    this.pager?.nextPage();
  }

  delete() {
    store.deleteSearch(this.id);
  }

  private validateStartConditions() {
    if (this.startedAt) throw new Error('Already started');
  }
}
