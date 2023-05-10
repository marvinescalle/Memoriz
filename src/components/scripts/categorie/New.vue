<script setup lang="ts">
import { ref, watch } from "vue"

import { useCategorieStore } from "@/store/categorie"

const categorie = useCategorieStore()

const titleRef = ref("")
const descriptionRef = ref("")
const loading = ref(false)
const showError = ref(false)

const refreshValue = () => {
  titleRef.value = ""
  descriptionRef.value = ""
  showError.value = false
}

const create = async () => {
  if (!titleRef.value) {
    showError.value = true
    return
  }
  loading.value = true
  await categorie.new({
    title: titleRef.value,
    description: descriptionRef.value || undefined,
  })

  loading.value = false
  refreshValue()
}

watch([categorie], ([categorie]) => {
  if (categorie.newOpen) return

  refreshValue()
})
watch([titleRef], () => {
  if (titleRef.value) showError.value = false
})
</script>

<template>
  <v-dialog v-model="categorie.newOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Nouvelle catégorie</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="titleRef"
            :error-messages="showError ? 'Title est obligatoire' : ''"
            label="Titre *"
            required
            variant="outlined"
          ></v-text-field>
          <v-textarea
            v-model="descriptionRef"
            label="Description"
            variant="outlined"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="() => (categorie.newOpen = false)"
          >Annuler</v-btn
        >
        <v-btn color="deep-purple-accent-2" variant="text" @click="create" :loading="loading">
          Créer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss"></style>
