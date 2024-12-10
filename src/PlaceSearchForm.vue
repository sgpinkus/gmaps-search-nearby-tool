<script lang='ts'>
import { defineComponent } from 'vue';
import { type LatLngLiteral } from 'leaflet';
import { get, cloneDeep } from 'lodash';
import { searchByText, type SearchResult } from './gmaps/searchByText';
import type { PropType } from 'vue';
export { type PlaceSummary } from './gmaps/searchByText';
export default defineComponent({
  props: {
    locationBias: { type: Object as PropType<LatLngLiteral>, required: false, default: undefined },
    apiKey: { type: String, required: true },
  },
  emits: ['update', 'cancel'],
  data(): Record<any, any> {
    return {
      searchText: '',
      searchResults: [],
      selectedSearchResult: null,
      isLoading: false,
      searchTimerId: null,
      descriptionLimit: 60,
    };
  },
  computed: {
    // Sanitize search result (assumed to be an object).
    selectedSearchResultFields () {
      const showKeys = {
        'formattedAddress': 'Address',
        'location': 'Location',
      };
      if (!this.selectedSearchResult) return [];
      const selectedSearchResult = cloneDeep(this.selectedSearchResult);
      return Object.fromEntries(Object.entries(showKeys).map(([k, title]) => [title, get(selectedSearchResult, k) ?? 'n/a']));
    },
  },
  watch: {
    searchText (val, oldVal) {
      if (this.searchText.length < 3) return;
      if (val.trim() === oldVal) return;
      if (this.isLoading) return;
      this.isLoading = true;
      if (this.searchTimerId) {
        clearTimeout(this.searchTimerId);
      }
      this.searchTimerId = setTimeout(() => {
        if (!this.searchText) return;
        searchByText({ textQuery: this.searchText, locationBias: this.locationBias }, this.apiKey)
          .then((data: SearchResult) => {
            this.searchResults = data.places.slice(0, 20);
            this.count = this.searchResults.length;
          })
          .catch((e: unknown) => {
            console.log(e);
          })
          .finally(() => (this.isLoading = false));
      }, 500);
    },
  },
  methods: {
    clearSearchResults() {
      this.selectedSearchResult = null;
      this.searchResults = [];
      this.searchText = '';
    },
    cancel() {
      this.$emit('cancel');
    },
    update() {
      if (this.selectedSearchResult) {
        this.$emit('update', this.selectedSearchResult);
      }
    },
  },
});
</script>

<template>
  <v-card>
    <v-card-text>
      <v-autocomplete
        v-model="selectedSearchResult"
        v-model:search="searchText"
        :items="searchResults"
        :loading="isLoading"
        item-title="formattedAddress"
        item-value="id"
        placeholder="Start typing to Search"
        prepend-icon="mdi-database-search"
        return-object
        no-filter
        style="max-height: 50vh;"
      />
    </v-card-text>
    <v-divider />
    <v-expand-transition>
      <div v-if="selectedSearchResult">
        <v-list color="red-lighten-3">
          <v-list-item
            v-for="(field, k) in selectedSearchResultFields"
            :key="k"
          >
            <v-list-item>
              <v-list-item-title>{{ field }}</v-list-item-title>
              <v-list-item-subtitle>{{ k }}</v-list-item-subtitle>
            </v-list-item>
          </v-list-item>
        </v-list>
      </div>
    </v-expand-transition>
    <v-divider v-if="selectedSearchResult" />
    <v-card-actions>
      <v-spacer />
      <v-btn
        variant="outlined"
        @click="cancel"
      >
        Cancel<v-icon end>
          mdi-arrow-left
        </v-icon>
      </v-btn>
      <v-btn
        :disabled="!selectedSearchResult"
        @click="clearSearchResults"
      >
        Clear Search<v-icon end>
          mdi-close-circle
        </v-icon>
      </v-btn>
      <v-btn
        :disabled="!selectedSearchResult"
        variant="outlined"
        @click="update"
      >
        Show on Map<v-icon end>
          mdi-map-marker
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
  .overlay-container {
    height: 100vh;
    width: 100%;
  }

  /** Fix: 16px is default vuetify v-btn style. Not sure why it's going to zero. */
  .v-btn {
    padding: 0 16px;
  }
</style>
