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
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import model from './model';

const emit = defineEmits(['ready']);

const mapStyle = {
 flex: 1,
 'flex-grow': 1,
};
const mapDefaults = computed(() => ({ // eslint-disable-line
  zoom: model.mapState.zoom,
  center: model.mapState.center,
}));
const showSettingsDialog = ref(model.apiKey ? false : true);

const map: Ref<Map | undefined> = ref(undefined);
 let changingLeafetProgrammatically: boolean = false;

watch(() => model.mapState.center,
  (center) => {
    setCenter(center, { animate: false });
  },
  { deep: true },
);

watch(
  () => model.mapState.zoom,
  zoom => {
    setZoom(zoom, { animate: false });
  },
);

function setZoom(zoom: number, options: L.ZoomOptions) {
  changingLeafetProgrammatically = true;
  map.value?.setZoom(zoom, options);
  setTimeout(() => changingLeafetProgrammatically = false, 0);
}

function setCenter(center: L.LatLngLiteral, options: L.PanOptions) {
  changingLeafetProgrammatically = true;
  map.value?.panTo(center, options);
  setTimeout(() => changingLeafetProgrammatically = false, 0);
}



function mapReady(mapObject: Map) {
  L.control.scale().addTo(mapObject);
  map.value = mapObject;
  emit('ready', mapObject);
  mapObject.on('zoom', () => {
    if (!changingLeafetProgrammatically) {
      const zoom = map.value?.getZoom();
      if (zoom) {
        model.mapState.zoom = zoom;
      }
    }
  });
  mapObject.on('moveend', () => {
    if (!changingLeafetProgrammatically) {
      const center = map.value?.getCenter();
      if (center) {
        model.mapState.center = center;
      }
    }
  });
}

function toggleTrack() {
  model.mapState.trackLocation = !model.mapState.trackLocation;
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
      :track-location="model.mapState.trackLocation"
      :last-location-lat-lng="model.mapState.lastLocationLatlng"
      @toggle-track="toggleTrack"
    />
    <slot />
  </LMap>
</template>