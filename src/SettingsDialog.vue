<script setup lang="ts">
/**
 * Settings dialog. This is always going to be a dialog so dialogness is baked in.
 */
import model from '@/model';

const emit = defineEmits(['update:modelValue']);
const open = defineModel<boolean>();

</script>
<template>
  <v-dialog
    v-model="open"
  >
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="6"
          offset-md="3"
        >
          <v-card>
            <v-list>
              <v-list-item>
                <v-label>API Key</v-label>
                <v-text-field
                  v-model="model.apiKey"
                  required="true"
                />
              </v-list-item>
            </v-list>
            <v-card-actions class="d-flex justify-end">
              <v-btn @click="emit('update:modelValue', false)">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>