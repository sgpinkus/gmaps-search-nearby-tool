<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { default as L, type Map, type ControlPosition } from 'leaflet';
import {
  LControl,
} from 'vue-leaflet-ng';
import model from '@/model/index';
import { default as SearchForm, type PlaceSummary } from './PlaceSearchForm.vue';

const { position = 'topright' } = defineProps<{ position?: ControlPosition }>();

const mapRef = ref(inject('map'));
let map: Map | undefined = undefined;
watch(mapRef, (newMap) => {
  if (!(newMap instanceof L.Map)) return;
  map = newMap;
}, { immediate: true });

const showSearchForm = ref(false);
const center = computed(() => {
  if (!(map instanceof L.Map)) return;
  return map.getCenter();
});

function searchFormUpdate(place: PlaceSummary) {
  if (!(map instanceof L.Map)) return;
  if (place.location) map.panTo(place.location);
  showSearchForm.value = false;
}
</script>

<template>
  <div>
    <v-dialog
      v-model="showSearchForm"
    >
      <SearchForm
        v-if="model.apiKey"
        :api-key="model.apiKey"
        :location-bias="center"
        @cancel="showSearchForm = false"
        @update="searchFormUpdate"
      />
    </v-dialog>
    <LControl :position="position">
      <v-btn
        icon="mdi-magnify"
        density="compact"
        :disabled="!model.apiKey"
        @click="showSearchForm = !showSearchForm"
      />
    </LControl>
  </div>
</template>

<style></style>