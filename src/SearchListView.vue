<script setup lang="ts">
/**
 * Use an invisible LMarker to make a LCircle draggable.
 */
import { computed, ref } from 'vue';
import PleaseConfirm from './PleaseConfirmForm.vue';
import SearchListItem from './SearchListViewItem.vue';
import SettingsDialog from './SettingsDialog.vue';
import router from './router';
import model from './model';
import MapComponent from './MapComponent.vue';

const navDrawerProps = {
  permanent: true,
  app: true,
  rail: false,
  order: 2,
  width: 300,
};
const drawer = ref(true);
const showResetDbDialog = ref(false);
const showSettingsDialog = ref(false);
const itemListClass = computed(() => !drawer.value ? 'item-list-rail' : 'item-list');

function newSearch() {
  router.dispatch({ name: 'new' });
}

</script>

<template>
  <v-dialog
    v-model="showResetDbDialog"
  >
    <PleaseConfirm
      @cancel="showResetDbDialog = false"
      @confirm="() => { model.reset(); showResetDbDialog = false; }"
    />
  </v-dialog>
  <SettingsDialog
    v-model="showSettingsDialog"
  />
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      v-bind="navDrawerProps"
    >
      <div class="d-flex flex-column">
        <v-list :class="itemListClass">
          <v-list-item
            class="pa-2"
          >
            <div class="d-flex flex-row justify-center">
              <v-btn
                class="ma-2 pa-0 flex-1 flex-grow-1"
                color="success"
                append-icon="mdi-folder-plus"
                @click="newSearch"
              >
                NEW SEARCH
              </v-btn>
            </div>
          </v-list-item>
          <v-list-item
            class="pa-2"
          >
            <div class="d-flex flex-row justify-center">
              <v-btn
                class="ma-2 pa-0 flex-1 flex-grow-1"
                color="warning"
                append-icon="mdi-delete"
                @click="showResetDbDialog = true"
              >
                RESET DB
              </v-btn>
            </div>
          </v-list-item>
          <v-list-item
            class="pa-2"
          >
            <div class="d-flex flex-row justify-center">
              <v-btn
                class="ma-2 pa-0 flex-1 flex-grow-1"
                append-icon="mdi-cog"
                @click="showSettingsDialog = !showSettingsDialog"
                @after-leave="showResetDbDialog = false"
              >
                SETTINGS
              </v-btn>
            </div>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list :class="itemListClass">
          <v-list-subheader v-if="drawer">
            My Searches ({{ model.searches.length }})
          </v-list-subheader>
          <SearchListItem
            v-for="search of model.searches"
            :key="search.id"
            :item="search"
            @delete="model.deleteSearch(search.id)"
          />
        </v-list>
      </div>
    </v-navigation-drawer>
    <v-main app>
      <div style="height:100vh; display: flex; flex-direction: column;">
        <MapComponent />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
  .item-list {
    overflow-y: scroll;
    font-size: smaller;
    min-height: 104px;
  }

  .item-list-rail {
    overflow-y: scroll;
    font-size: smaller;
    min-height: 64px;
  }
</style>