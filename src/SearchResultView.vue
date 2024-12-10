<script setup lang="tsx">
/**
 * Overloaded view that provides a form for filling out search query details, action to convert a query into a started search
 * and a map to view search results (given optional search is present). Also used as view for saved searches that have
 * previously run to completion (the form is set to read only and act as display of query param).
 */
import { computed, onBeforeMount, reactive, ref, type Ref } from 'vue';
import {
  LCircle,
  LMarker,
} from 'vue-leaflet-ng';
import router from '@/router';
import { default as model, Search } from '@/model/index';
import MapComponent from './MapComponent.vue';
import type { MySearchNearbyRequest } from './gmaps/searchNearBy';
import { cloneDeep } from 'lodash';
import ZoomToRadiusControl from './ZoomToRadiusControl.vue';

const { id: searchId = undefined } = defineProps<{ id?: string }>();

const navDrawerProps = {
  permanent: true,
  app: true,
  rail: false,
  order: 2,
  width: 300,
};
const rail = ref(true);
let search: Search | undefined;
const query: Partial<MySearchNearbyRequest> = reactive({});
const centerString = computed(() => query.location ? `${Number(query.location.lat).toFixed(6)}, ${Number(query.location.lng).toFixed(6)}` : '');
const circle = computed(() => ((query.location && query.radius) ? ({ location: query.location, radius: query.radius }) : undefined ));
const showNextPageAction = computed(() => !!search && !!search.pager);
const enableNextPageAction = computed(() => search!.hasNextPage);
const mapView = ref(true);
const columns = Search.PlaceDetailFields;

const blobUrl = ref('');

function exportModel() {
  const data = JSON.stringify(search?.results);
  const blob = new Blob([data], { type: 'application/json' });
  blobUrl.value = URL.createObjectURL(blob);
}


onBeforeMount(() => {
  if (searchId) {
    search = model.getSearch(searchId);
    if (!search) return router.dispatch({ name: 'resource-not-found', params: { resource: searchId } });
    Object.assign(query, cloneDeep(search.query));
  }
});

function nextPage() {
  search!.nextPage();
}

function deleteMe() {
  if (search) {
    model.deleteSearch(search.id);
  }
  router.dispatch({ path: '/' });
}

</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-model="rail"
      v-bind="navDrawerProps"
    >
      <v-list>
        <route-path path="/">
          <v-list-item prepend-icon="mdi-arrow-left" />
        </route-path>
      </v-list>
      <v-divider />
      <v-list>
        <v-list-item
          title="Center Location"
          :subtitle="centerString"
        />
        <v-list-item
          title="Radius"
          :subtitle="`${query.radius}m`"
        />
        <v-list-item
          title="Type of Place"
          :subtitle="query.type || 'none'"
        />
        <v-list-item
          title="Started At"
          :subtitle="String(search!.startedAt)"
        />
        <v-list-item
          title="Status"
          :subtitle="search!.status"
        />
        <v-list-item
          title="Has Next Page"
          :subtitle="search!.hasNextPage ? 'Yes' : 'No'"
        />
        <v-list-item
          title="#Results"
          :subtitle="search!.results.length"
        />
        <v-list-item>
          <v-list-item-title>
            Display Mode
          </v-list-item-title>
          <v-list-item-subtitle>
            <v-switch
              v-model="mapView"
              style="display: inline;"
              hide-details
              :label="mapView ? 'map' : 'table'"
            />
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-list>
        <v-list-item
          v-if="showNextPageAction"
        >
          <div class="d-flex flex-row justify-center">
            <v-btn
              :disabled="!enableNextPageAction"
              class="ma-2 pa-0 flex-1 flex-grow-1"
              color="success"
              @click="nextPage"
            >
              NEXT PAGE
            </v-btn>
          </div>
        </v-list-item>
        <v-list-item>
          <div class="d-flex flex-row justify-center">
            <v-btn
              class="ma-2 pa-0 flex-1 flex-grow-1"
              color="warning"
              append-icon="mdi-delete"
              @click="deleteMe"
            >
              DELETE
            </v-btn>
          </div>
        </v-list-item>
        <v-list-item>
          <div class="d-flex flex-row justify-center">
            <v-btn
              class="ma-2 pa-0 flex-1 flex-grow-1"
              append-icon="mdi-export"
              @click="exportModel"
            >
              <a
                :href="blobUrl"
                download="results.json"
              >DOWNLOAD DATA</a>
            </v-btn>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main app>
      <div style="height:100vh; display: flex; flex-direction: column;">
        <MapComponent
          v-if="mapView"
        >
          <ZoomToRadiusControl
            :circle="circle"
          />
          <LCircle
            :lat-lng="query.location!"
            :radius="query.radius"
          />
          <template
            v-for="(result) of search?.results"
            :key="result.id"
          >
            <LMarker
              v-if="result.location"
              :lat-lng="result.location"
              :popup-text="JSON.stringify(result)"
            />
          </template>
        </MapComponent>
        <div v-else>
          <v-table class="mx-auto">
            <thead>
              <tr>
                <th
                  v-for="h in columns"
                  :key="h"
                >
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in search?.results"
                :key="row.id"
              >
                <template
                  v-for="v in columns"
                  :key="`${row.id}.${v}`"
                >
                  <td>{{ row[v] ?? '-' }}</td>
                </template>
                <td style="text-align: x" />
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </v-main>
  </v-app>
</template>