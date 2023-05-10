<script setup lang="ts">
import { ref } from "vue"

import { useCarteStore } from "@/store/cartes"

const carte = useCarteStore()

const loading = ref(false)

const deleteCarte = async () => {
  if (!carte.deleteCarte) return

  loading.value = true
  await carte.delete(carte.deleteCarte)
  loading.value = false
}
</script>

<template>
  <v-dialog v-model="carte.deleteOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Supprimer</span>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="deep-purple-accent-2"
          variant="text"
          @click="() => (carte.deleteOpen = false)"
          >Annuler</v-btn
        >
        <v-btn color="deep-purple-accent-2" variant="text" @click="deleteCarte" :loading="loading">
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss"></style>
