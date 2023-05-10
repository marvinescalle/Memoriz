<script setup lang="ts">
import { ref, watch } from "vue"

import { useCategorieStore } from "@/store/categorie"
import { useThemeStore } from "@/store/theme"

const categorie = useCategorieStore()
const theme = useThemeStore()

const titleRef = ref("")
const descriptionRef = ref("")
const categorieId = ref<number | null>(null)
const loading = ref(false)
const showError = ref(false)

const edit = async () => {
  if (
    !titleRef.value ||
    !theme.editTheme ||
    (theme.editWithCategorie && categorieId.value === null)
  ) {
    showError.value = true
    return
  }
  loading.value = true
  await theme.edit(theme.editTheme, {
    title: titleRef.value,
    description: descriptionRef.value || undefined,
    categorieId: categorieId.value ?? undefined,
  })

  loading.value = false
  titleRef.value = ""
  descriptionRef.value = ""
  showError.value = false
}

watch([theme], ([theme]) => {
  showError.value = false
  if (theme.editOpen) {
    titleRef.value = theme.editTheme?.title || ""
    descriptionRef.value = theme.editTheme?.description || ""
    categorieId.value = theme.editTheme?.categorieId || null
  } else {
    titleRef.value = ""
    descriptionRef.value = ""
    categorieId.value = null
  }
})
watch([titleRef, categorieId], () => {
  if (titleRef.value && categorieId.value) showError.value = false
  else showError.value = true
})
</script>

<template>
  <v-dialog v-model="theme.editOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Éditer le thème</span>
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
          <v-autocomplete
            v-if="theme.editWithCategorie"
            v-model="categorieId"
            :error-messages="showError && !categorieId ? 'La catégorie est obligatoire' : ''"
            :items="categorie.list"
            item-text="title"
            item-value="id"
            label="Catégorie *"
            variant="outlined"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="() => (theme.editOpen = false)"
          >Annuler</v-btn
        >
        <v-btn color="deep-purple-accent-2" variant="text" @click="edit" :loading="loading">
          Éditer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss"></style>
