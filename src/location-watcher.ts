import { reactive } from 'vue';
import { geolocationPositionToObject, type PlainGeolocationPosition } from './utils';

const LocationMaximumAge = 15000;

type SubscribeEventName = 'location-update' | 'location-status-change' | 'location-error';

class LocationWatcher {
  private listeners: EventTarget;
  locationUnavailable = true;
  locationWatchId = 0;
  lastLocation?: PlainGeolocationPosition;

  get latLng() {
    return this.lastLocation ? { lat: this.lastLocation.coords.latitude, lng: this.lastLocation.coords.longitude } : undefined;
  }

  get watchingLocation() {
    return !!this.locationWatchId;
  }

  constructor(data?: { lastLocation: GeolocationPosition }) {
    if (data?.lastLocation) this.lastLocation = data.lastLocation;
    this.listeners = new EventTarget();
  }

  start() {
    if (!('geolocation' in navigator)) {
      this.locationUnavailable = true;
      console.error('Geolocation not supported.');
      return;
    }
    // Sanity check permission is definitely granted!
    navigator.permissions.query({
      name: 'geolocation',
    }).then((data) => console.log('User geolocation permission status:', data))
    .catch();
    this.locationUnavailable = false;
    this.locationWatchId = navigator.geolocation.watchPosition(
      (...args) => reactive(this).locationSuccess(...args),
      (...args) => reactive(this).locationError(...args),
      {
        maximumAge: LocationMaximumAge,
        enableHighAccuracy: true,
      },
    );
  }

  stop() {
    navigator.geolocation.clearWatch(this.locationWatchId);
    this.locationWatchId = 0;
  }

  toObject() {
    return { lastLocation: this.lastLocation };
  }

  locationSuccess(position: GeolocationPosition) {
    this.locationUnavailable = false;
    this.lastLocation = geolocationPositionToObject(position);
    this.listeners.dispatchEvent(new CustomEvent('location-update', { detail: this.lastLocation }));
  }

  locationError(e: GeolocationPositionError) {
    console.error(`Location Error: ${e.message}`);
    this.locationUnavailable = true;
    this.stop();
    this.listeners.dispatchEvent(new CustomEvent('location-error', { detail: {} }));
  }

  addEventListener(name: SubscribeEventName, f: (evt: CustomEvent) => void) {
    this.listeners.addEventListener(name, f as (evt: Event) => void);
  }

  removeEventListener(name: SubscribeEventName, f: (evt: CustomEvent) => void) {
    this.listeners.removeEventListener(name, f as (evt: Event) => void);
  }
}

export default LocationWatcher;