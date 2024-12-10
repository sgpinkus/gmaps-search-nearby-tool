<script setup lang="ts">
import { computed, inject, nextTick, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { default as L, type Map, type ControlPosition } from 'leaflet';
import {
  LControl,
  LMarker,
} from 'vue-leaflet-ng';
import LocationWatcher from './location-watcher';
import markerTemplates from './marker-templates';


const { position = 'bottomright' } = defineProps<{ position?: ControlPosition }>();

const mapRef = ref(inject('map'));
let map: Map | undefined = undefined;
watch(mapRef, (newMap) => {
  if (!newMap || !(newMap instanceof L.Map)) return;
  console.log('LocationTracking: map ready');
  map = newMap;
  nextTick(() => map!.on('move', unTrack));
}, { immediate: true });
const trackLocation = ref(false);
const locationWatcher = reactive(new LocationWatcher());
const trackingLocation = computed(() => locationWatcher.watchingLocation);
const lastLocation = computed(() => locationWatcher.lastLocation);
const lastLocationLatLng = computed(() => (lastLocation.value?.coords ? { lat: lastLocation.value?.coords.latitude, lng: lastLocation.value?.coords.longitude } : undefined));
const markerIcon = L.divIcon({
  html: markerTemplates['target']({ color1: 'rgba(96,96,96,96)' }),
  iconSize: [12, 12],
  iconAnchor: undefined,
  className: '',
});
const markerPopupText = computed(() => `
  <h3>You</h3>
  <dl>
    <dt>Location</dt><dd>${lastLocation.value}</dd><br>
  </dl>
`);

watchEffect(() => {
  if (trackLocation.value) locationWatcher.start();
  else (locationWatcher.stop());
});

watchEffect(() => {
  if (!trackingLocation.value && trackLocation) trackLocation.value = false;
});

watch(locationWatcher, () => {
  if (trackLocation.value && lastLocationLatLng.value) {
    if (map instanceof L.Map) map.panTo(lastLocationLatLng.value, { animate: false });
  }
});

onUnmounted(() => {
   if (!(map instanceof L.Map)) return;
   map.off('move', unTrack);
});

function unTrack() {
  trackLocation.value = false;
}

</script>
<template>
  <div>
    <LControl
      :position="position"
      :title="trackLocation ? 'tracking location' : 'track location'"
    >
      <v-btn
        :active="trackLocation"
        :icon="trackLocation ? lastLocation ? 'mdi-crosshairs-gps' : 'mdi-crosshairs-question' : 'mdi-crosshairs'"
        density="compact"
        @click.stop="trackLocation = !trackLocation"
      />
    </LControl>
    <LMarker
      v-if="lastLocationLatLng"
      ref="layer"
      :lat-lng="lastLocationLatLng"
      :icon="markerIcon"
      v-bind="$attrs"
      :popup-text="markerPopupText"
      class="location-tracking-marker"
    />
  </div>
</template>