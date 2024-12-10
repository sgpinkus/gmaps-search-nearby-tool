<script setup lang="ts">
import {
  LTileLayer,
  LControl,
} from 'vue-leaflet-ng';
import tileLayers from './map-tile-layers';
import { computed, ref } from 'vue';

const activeTileLayerIndex = ref(0);
const activeTileLayer = computed(() => tileLayers[activeTileLayerIndex.value]);

</script>
<template>
  <div>
    <LTileLayer
      v-if="activeTileLayerIndex === 0"
      :="tileLayers[0]"
    />
    <LTileLayer
      v-if="activeTileLayerIndex === 1"
      :="tileLayers[1]"
    />
    <LControl
      position="topright"
      :title="activeTileLayer.name"
    >
      <v-btn
        icon="mdi-layers"
        density="compact"
        @click="(activeTileLayerIndex = (activeTileLayerIndex + 1) % 2)"
      />
    </LControl>
  </div>
</template>