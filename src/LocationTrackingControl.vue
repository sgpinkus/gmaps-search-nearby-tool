<script setup lang="ts">
import { computed } from 'vue';
import { default as L, type ControlPosition } from 'leaflet';
import {
  LControl,
  LMarker,
} from 'vue-leaflet-ng';
import markerTemplates from './marker-templates';

type Props = {
  position?: ControlPosition,
  trackLocation: boolean,
  lastLocationLatLng: { lat: number, lng: number } | undefined,
};

const emit = defineEmits(['toggleTrack']);

const { position = 'bottomright', trackLocation, lastLocationLatLng  } = defineProps<Props>();

const markerIcon = L.divIcon({
  html: markerTemplates['target']({ color1: 'rgba(96,96,96,96)' }),
  iconSize: [12, 12],
  iconAnchor: undefined,
  className: '',
});
const markerPopupText = computed(() => `
  <h3>You</h3>
  <dl>
    <dt>Location</dt><dd>${lastLocationLatLng}</dd><br>
  </dl>
`);

</script>
<template>
  <div>
    <LControl
      :position="position"
      :title="trackLocation ? 'tracking location' : 'track location'"
    >
      <v-btn
        :active="trackLocation"
        :icon="trackLocation ? lastLocationLatLng ? 'mdi-crosshairs-gps' : 'mdi-crosshairs-question' : 'mdi-crosshairs'"
        :title="trackLocation ? lastLocationLatLng ? 'mdi-crosshairs-gps' : 'mdi-crosshairs-question' : 'mdi-crosshairs'"
        density="compact"
        @click.stop="emit('toggleTrack')"
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