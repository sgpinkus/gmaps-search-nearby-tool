<script setup lang="ts">
import L from 'leaflet';
import type { Map } from 'leaflet';
import {
  LMap,
  LControl,
} from 'vue-leaflet-ng';
import SettingsDialog from './SettingsDialog.vue';
import TileLayers from './TileLayers.vue';
import PlaceSearchControl from './PlaceSearchControl.vue';
import LocationTrackingControl from './LocationTrackingControl.vue';
import { ref } from 'vue';
import model from './model';

const emit = defineEmits(['ready']);

const mapStyle = {
 flex: 1,
 'flex-grow': 1,
};
const mapDefaults = { // eslint-disable-line
  zoom: 11,
  center: { lat: -25.3444277, lng: 131.0368822 },
};
const showSettingsDialog = ref(model.apiKey ? false : true);


function mapReady(mapObject: Map) {
  L.control.scale().addTo(mapObject);
  emit('ready', mapObject);
}
</script>


<template>
  <SettingsDialog v-model="showSettingsDialog" />
  <LMap
    ref="my-map"
    :style="mapStyle"
    :="mapDefaults"
    @ready="mapReady"
  >
    <TileLayers />
    <LControl
      position="topright"
    >
      <v-btn
        icon="mdi-cog"
        density="compact"
        @click="showSettingsDialog = !showSettingsDialog"
      />
    </LControl>
    <PlaceSearchControl
      position="topright"
    />
    <LocationTrackingControl
      position="bottomright"
    />
    <slot />
  </LMap>
</template>