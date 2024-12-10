<script setup lang="ts">

const emit = defineEmits(['cancel', 'confirm']);

</script>

<template>
  <v-container>
    <v-row justify="space-around">
      <v-card style="padding: 1em">
        <v-card-title style="text-align: center;">
          PLEASE CONFIRM
        </v-card-title>
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            @click="() => emit('cancel')"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="() => emit('confirm')"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>