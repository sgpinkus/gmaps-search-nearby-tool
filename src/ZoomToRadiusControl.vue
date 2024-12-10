<script setup lang="tsx">
import { inject, ref, watch } from 'vue';
import L from 'leaflet';
import type { Map, ControlPosition, LatLngLiteral } from 'leaflet';
import {
  LControl,
} from 'vue-leaflet-ng';

const { position = 'bottomright', circle } = defineProps<{
  position?: ControlPosition,
  circle?: { location: LatLngLiteral, radius: number }
}>();

const mapRef = ref(inject('map'));
let map: Map | undefined = undefined;
watch(mapRef, (newMap) => {
  if (!newMap || !(newMap instanceof L.Map)) return;
  map = newMap;
}, { immediate: true });

function zoomToCircle() {
  if (!circle) return;
  const latLngBounds = L.latLng(circle.location).toBounds(circle.radius*2);
  map?.fitBounds(latLngBounds);
}

</script>

<template>
  <LControl
    :position="position"
  >
    <v-btn
      icon="mdi-circle-expand"
      density="compact"
      :disabled="!circle"
      @click="zoomToCircle"
    />
  </LControl>
</template>