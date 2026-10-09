// / <reference types="@types/google.maps" />
import { reactive, toRaw, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import { type MySearchNearbyRequest } from '@/gmaps/searchNearBy';
import { AppName } from '@/constants';
import Search from './search';
import LocationWatcher from '@/location-watcher';
import type { NewPlaceResult } from '@/gmaps/searchNearBy';
export { default as Search } from './search';
import { type LatLngLiteral } from 'leaflet';

type LatLng = LatLngLiteral;

/**
 * The starting of tracking location typically needs to be in response to a gesture AFAIK.
 * Because of this trackLocation can't be stored and revived.
 */
const locationWatcher = new LocationWatcher();

class MapState {
  zoom: number = 11;
  _center: LatLng = { lat: -25.3444277, lng: 131.0368822 }; // User specified center.

  constructor() {
    locationWatcher.addEventListener('location-update', (e) => reactive(this).locationUpdate(e));
  }

  get trackLocation() {
    return locationWatcher.watchingLocation;
  }

  get lastLocationLatlng() {
    return locationWatcher.latLng;
  }

  get center(): LatLng {
    return this._center;
  }

  set center(v: LatLng) {
    this._center = v;
    this.trackLocation = false;
  }

  set trackLocation(v: boolean) {
    if (v) {
      locationWatcher.start();
    } else {
      locationWatcher.stop();
    }
  }

  locationUpdate(e: CustomEvent) {
    console.log('location-update', { latlng: locationWatcher.latLng, tracking: this.trackLocation });
    if (this.trackLocation && locationWatcher.latLng) {
      this._center = locationWatcher.latLng;
    }
  }
}

export class Store {
  apiKey?: string;
  _searches: Record<string, Search> = {};
  placeCache: Record<string, NewPlaceResult> = {};
  mapState: MapState = new MapState();

  get searches() {
    return Object.values(this._searches);
  }

  createSearch(query: MySearchNearbyRequest): Search {
    if (!this.apiKey) throw new Error('API required to start new search');
    return new Search(this.apiKey, query);
  }

  async startNewSearch(query: MySearchNearbyRequest): Promise<Search> {
    const search = this.createSearch(query as MySearchNearbyRequest);
    await search.start();
    this.addSearch(search);
    return search;
  }

  addSearch(search: Search) {
    this._searches[search.id] = search;
    return search;
  }

  getSearch(id: string): Search | undefined {
    return this._searches[id];
  }

  deleteSearch(id: string) {
    if (this._searches[id]) this._searches[id].deleted = true;
    delete this._searches[id];
  }

  reset() {
    this.apiKey = undefined;
    this._searches = {};
    syncLocalStorage();
  }
}

export function fromLocalStorage() {
  testLocalStorage();
  const data = window.localStorage.getItem(AppName);
  if (data) return jsonParse(data);
  return new Store();
}

const PlainTypes = [Function, Object, Array, String, Number, BigInt];
const BlackList = ['SearchNearByService'];

function jsonReplacer(_k: string, v: any) {
  if (v instanceof Object && ![...PlainTypes, ...BlackList].includes(v.constructor)) {
    return { ...v, __CLASS__: v.constructor.name };
  }
  return v;
}

function jsonReviver(k: string, v: any) {
  if (v?.__CLASS__) {
    const _class = eval(v.__CLASS__);
    let o;
    if (_class['fromObject']) {
      o = _class['fromObject'](v);
    } else {
      o = new _class();
      Object.assign(o, v);
    }
    delete o.__CLASS__;
    return o;
  }
  return v;
}

export function jsonStringify(o: unknown) {
  return JSON.stringify(toRaw(o), jsonReplacer);
}

export function jsonParse(o: string) {
  return JSON.parse(o, jsonReviver);
}

export function testLocalStorage() {
  console.info('Testing local storage access');
  const v = uuid();
  window.localStorage.setItem(v, v);
  const success = window.localStorage.getItem(v) === v;
  window.localStorage.removeItem(v);
  if (success) {
    console.info('Local storage access OK');
  } else {
    console.error('Can\'t access local storage');
  }
  return success;
}

testLocalStorage();

const lastLocalData = window.localStorage.getItem(AppName);
let _store;
if (lastLocalData) {
  try {
    _store = jsonParse(lastLocalData);
  } catch {
    console.error('Failed to reload store from local storage');
    _store = new Store();
  }
}
const store: Store = reactive(_store || new Store());

let localStorageWriteTimerId = 0;

watch(store, () => {
  console.debug('Local storage sync: Model may have changed ...');
  if (localStorageWriteTimerId) return console.log('Local storage sync: Already writing.');
  // const diff = deepDiffObjects(store, lastLocalData);
  // if (diff) { ... }
  console.log('Local storage sync: Model data changed, committing to local storage');
  localStorageWriteTimerId = setTimeout(_syncLocalStorage, 2000);
});

function _syncLocalStorage() {
  try {
    window.localStorage.setItem(AppName, jsonStringify(store));
  } finally {
    localStorageWriteTimerId = 0;
  }
}

export function syncLocalStorage() {
  clearInterval(localStorageWriteTimerId);
  _syncLocalStorage();
}

export default store;