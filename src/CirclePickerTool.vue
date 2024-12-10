<script setup lang="ts">
/**
 * Circle picker (meaing center latlng and radius is meters. Circles aren't draggable to implement drag effects
 * thsi component needs access to the map object so it can listen to mousemove event.
 */
import { inject, onMounted, onUnmounted, ref, watch, type Ref } from 'vue';
import type { LatLngLiteral, LeafletMouseEvent, Map } from 'leaflet';
import {
  LMarker,
  LCircle,
} from 'vue-leaflet-ng';
import markerTemplates from './marker-templates';

const DefaultMaxRadius = 1000000;

// Initial center and radius.
const props = defineProps<{
  center?: LatLngLiteral,
  radius?: number,
  maxRadius?: number,
}>();
const emit = defineEmits(['update']);

const center: Ref<LatLngLiteral | undefined> = ref(props.center);
const radius: Ref<number> = ref(props.radius || 0);
const cursorLocation: Ref<LatLngLiteral | undefined> = ref(undefined);
const myIcon = L.divIcon({
  html: markerTemplates['circle']({ color1: 'white', size: 12 }),
  iconSize: [20, 20],
  className: 'circle-picker-invisible-marker',
});

const mapRef = ref(inject('map'));
let map: Map | undefined = undefined;
watch(mapRef, (newMap) => {
  if (!newMap) return;
  if (!(newMap instanceof L.Map)) return;
  map = newMap;
  map.on('mousemove', mapMouseMove);
}, { immediate: true });

function toolDrag(e: any) {
  if (e.target._latlng && center.value) {
    radius.value = Math.min(props.maxRadius || DefaultMaxRadius, Math.round(L.latLng(center.value).distanceTo(e.target._latlng)));
  }
}

function toolMouseDown(e: LeafletMouseEvent) {
  if (e.latlng) {
    center.value = e.latlng;
  }
}

function toolMouseUp() {
  emit('update', { center: center.value, radius: radius.value });
}

function mapMouseMove(e: LeafletMouseEvent) {
  cursorLocation.value = e.latlng;
}

onMounted(() => {
});

onUnmounted(() => {
  if (map && map.off) map.off('mousemove', mapMouseMove);
});

</script>

<template>
  <LMarker
    v-if="cursorLocation"
    ref="marker"
    :lat-lng="cursorLocation"
    :radius="20"
    :draggable="true"
    :z-index-offset="100"
    :icon="myIcon"
    @drag="toolDrag"
    @mousedown="toolMouseDown"
    @mouseup="toolMouseUp"
  />
  <LCircle
    v-if="center && radius"
    :lat-lng="center"
    :radius="radius"
  />
</template>

<style>
.circle-picker-invisible-marker {
  opacity: 0;
  cursor: crosshair;
}
</style>