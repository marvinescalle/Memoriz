<script setup lang="ts">
import { ref } from "vue"

import { useCategorieStore } from "@/store/categorie"

const categorie = useCategorieStore()

const loading = ref(false)

const deleteCategorie = async () => {
  if (!categorie.deleteCategorie) return

  loading.value = true
  await categorie.delete(categorie.deleteCategorie)
  loading.value = false
}
</script>

<template>
  <v-dialog v-model="categorie.deleteOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5 ">Supprimer la catégorie</span>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="deep-purple-accent-2"
          variant="text"
          @click="() => (categorie.deleteOpen = false)"
          >Annuler</v-btn
        >
        <v-btn color="deep-purple-accent-2" variant="text" @click="deleteCategorie" :loading="loading">
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss"></style>
