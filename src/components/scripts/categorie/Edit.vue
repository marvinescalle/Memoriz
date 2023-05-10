<script setup lang="ts">
import { ref, watch } from "vue"

import { useCategorieStore } from "@/store/categorie"

const categorie = useCategorieStore()

const titleRef = ref("")
const descriptionRef = ref("")
const loading = ref(false)
const showError = ref(false)

const edit = async () => {
  if (!titleRef.value || !categorie.editCategorie) {
    showError.value = true
    return
  }
  loading.value = true
  await categorie.edit(categorie.editCategorie, {
    title: titleRef.value,
    description: descriptionRef.value || undefined,
  })

  loading.value = false
  titleRef.value = ""
  descriptionRef.value = ""
  showError.value = false
}

watch([categorie], ([categorie]) => {
  showError.value = false
  if (categorie.editOpen) {
    titleRef.value = categorie.editCategorie?.title || ""
    descriptionRef.value = categorie.editCategorie?.description || ""
  } else {
    titleRef.value = ""
    descriptionRef.value = ""
  }
})
watch([titleRef], () => {
  if (titleRef.value) showError.value = false
  else showError.value = true
})
</script>

<template>
  <v-dialog v-model="categorie.editOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Éditer la catégorie</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="titleRef"
            :error-messages="showError ? 'Le titre est obligatoire' : ''"
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
          color="deep-purple-accent-2"
          variant="text"
          @click="() => (categorie.editOpen = false)"
          >Annuler</v-btn
        >
        <v-btn color="deep-purple-accent-2" variant="text" @click="edit" :loading="loading">
          Éditer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss">
*{
color: #8c61ff;  

}</style>
