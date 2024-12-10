// / <reference types="@types/google.maps" />
import { reactive, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import { type MySearchNearbyRequest } from '@/gmaps/searchNearBy';
import { AppName } from '@/constants';
import Search from './search';
import type { NewPlaceResult } from '@/gmaps/utils';
export {default as Search} from './search';

export class Store {
  apiKey?: string;
  _searches: Record<string, Search> = {};
  placeCache: Record<string, NewPlaceResult> = {};

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

function jsonReplacer(k: string, v: any) {
  if (v instanceof Object && ![Function, Object, Array, String, Number, BigInt].includes(v.constructor)) {
    v.__CLASS__ = v.constructor.name;
    if (v.constructor.name === 'SearchNearByService') return undefined;
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
  return JSON.stringify(o, jsonReplacer);
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
  console.debug('Local storage sync: Model may havae changed ...');
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