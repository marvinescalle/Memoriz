<script setup lang="ts">
import { ref } from "vue"

import { useThemeStore } from "@/store/theme"

const theme = useThemeStore()

const loading = ref(false)

const deleteTheme = async () => {
  if (!theme.deleteTheme) return

  loading.value = true
  await theme.delete(theme.deleteTheme)
  loading.value = false
}
</script>

<template>
  <v-dialog v-model="theme.deleteOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Supprimer le thème</span>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="() => (theme.deleteOpen = false)"
          >Annuler</v-btn
        >
        <v-btn color="danger" variant="text" @click="deleteTheme" :loading="loading">
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss"></style>
