<script setup lang="tsx">
/**
 * Overloaded view that provides a form for filling out search query details, action to convert a query into a started search
 * and a map to view search results (given optional search is present). Also used as view for saved searches that have
 * previously run to completion (the form is set to read only and act as display of query param).
 */
import { computed, reactive, ref, type Ref } from 'vue';
import type { LatLngLiteral } from 'leaflet';
import {
  LCircle,
} from 'vue-leaflet-ng';
import router from '@/router';
import model from '@/model/index';
import MapComponent from './MapComponent.vue';
import CirclePickerTool from './CirclePickerTool.vue';
import placeTypes from './gmaps/gmaps-query-types.json';
import { MaxSearchRadius } from './constants';
import type { MySearchNearbyRequest } from './gmaps/searchNearBy';
import ZoomToRadiusControl from './ZoomToRadiusControl.vue';

const navDrawerProps = {
  permanent: true,
  app: true,
  rail: false,
  order: 2,
  width: 300,
};
const rail = ref(true);
const query: Partial<MySearchNearbyRequest> = reactive({});
const circlePickerActive = ref(false);
const centerString = computed(() => query.location ? `${Number(query.location.lat).toFixed(6)}, ${Number(query.location.lng).toFixed(6)}` : '');
const circle = computed(() => ((query.location && query.radius) ? ({ location: query.location, radius: query.radius }) : undefined ));
const queryValid: Ref<boolean> = computed(() => {
  return !!(query.location) && !!(query.radius) && !!(model!.apiKey) && !!(model!.apiKey.length);
});
const formDisabled = computed(() => !model.apiKey);
const enableStartAction = computed(() => queryValid.value);

function CirclePickerBtn({ disabled = false }) {
  return (
    <v-btn
      onClick={() => circlePickerActive.value = !circlePickerActive.value}
      active={circlePickerActive.value}
      icon={circlePickerActive.value ? 'mdi-circle-double' : 'mdi-circle'}
      density='compact'
      color={circlePickerActive.value ? 'primary' : 'initial'}
      disabled={disabled}
    >
    </v-btn>
  );
}

function circlePickerUpdate(update: { center: LatLngLiteral, radius: number }) {
  query.location = update.center;
  query.radius = Math.min(MaxSearchRadius, update.radius);
}

async function startSearch() {
  circlePickerActive.value = false;
  if (!queryValid.value) throw new Error('Invalid query');
  const search = await model.startNewSearch(query as MySearchNearbyRequest);
  router.dispatch({ name: 'search', params: { id: search.id } });
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
        <v-list-subheader v-if="rail">
          Search Query
        </v-list-subheader>
        <v-form :disabled="formDisabled">
          <v-list-item>
            <v-label>
              Type of Place
            </v-label>
            <v-select
              v-model:model-value="query.type"
              :items="placeTypes"
              :clearable="true"
              placeholder="none"
            />
          </v-list-item>
          <v-list-item>
            <v-label>Center Location</v-label><br>
            <v-text-field
              v-model:model-value="centerString"
              :readonly="true"
            >
              <template #append-inner>
                <CirclePickerBtn />
              </template>
            </v-text-field>
          </v-list-item>
          <v-list-item>
            <v-label>Radius</v-label>
            <v-text-field
              v-model:model-value.number="query.radius"
              variant="outlined"
              density="compact"
              :readonly="true"
            >
              <template #append-inner>
                <CirclePickerBtn />
              </template>
            </v-text-field>
          </v-list-item>
        </v-form>
      </v-list>
      <v-list>
        <v-list-item
          class="pa-2"
        >
          <div class="d-flex flex-row justify-center">
            <v-btn
              :disabled="!enableStartAction"
              class="ma-2 pa-0 flex-1 flex-grow-1"
              color="success"
              @click="startSearch"
            >
              START
            </v-btn>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main app>
      <div style="height:100vh; display: flex; flex-direction: column;">
        <MapComponent>
          <ZoomToRadiusControl
            :circle="circle"
          />
          <CirclePickerTool
            v-if="circlePickerActive"
            :center="query.location"
            :radius="query.radius"
            :max-radius="MaxSearchRadius"
            @update="circlePickerUpdate"
          />
          <LCircle
            v-if="query.location && !circlePickerActive"
            :lat-lng="query.location"
            :radius="query.radius"
          />
        </MapComponent>
      </div>
    </v-main>
  </v-app>
</template>