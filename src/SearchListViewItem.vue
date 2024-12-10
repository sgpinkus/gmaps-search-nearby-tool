<script setup lang="ts">
import type { Search } from './model';


const emit = defineEmits(['click', 'delete']);
const { item, focused = false } = defineProps<{
  item: Search,
  focused?: boolean,
}>();
</script>

<template>
  <v-list-item
    id="`list-item-${item.id}`"
    :class="{ focused }"
  >
    <div class="d-flex flex-nowrap flex-row justify-space-between">
      <v-list-item-title>
        <route-path
          :path="`/s/${item.id}`"
        >
          {{ item.title }}
        </route-path>
      </v-list-item-title>
      <v-btn
        flat
        density="compact"
        :block="false"
        @click="emit('delete')"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
  </v-list-item>
</template>

<style scoped>
.focused {
  background-color: lightgray;
}

.v-btn {
  min-width: 1em;
  padding: 0;
  margin: 0;
}
</style>
