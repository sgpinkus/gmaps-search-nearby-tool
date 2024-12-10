import { pick } from  'lodash';

export type PlainGeolocationCoordinates = Omit<GeolocationCoordinates, 'toJSON'>;
export type PlainGeolocationPosition = { coords: PlainGeolocationCoordinates, timestamp: GeolocationPosition['timestamp'] };

/**
 * coords and timestamp are implemented as getters at least in FF so won't just JSON.stringify.
 * https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition
 */
export function geolocationPositionToObject(o: GeolocationPosition): PlainGeolocationPosition {
  return { timestamp: o.timestamp, coords: pick(o.coords, ['accuracy', 'altitude', 'altitudeAccuracy', 'heading', 'latitude', 'longitude', 'speed']) };
}

export function toLatLng(location: PlainGeolocationPosition) {
  return { lat: location.coords.latitude, lng: location.coords.longitude };
}

