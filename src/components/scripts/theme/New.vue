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

const refreshValue = () => {
  titleRef.value = ""
  descriptionRef.value = ""
  categorieId.value = null
  showError.value = false
}
const create = async () => {
  const catId = theme.newTheme?.id ?? categorieId.value
  if (!titleRef.value || catId === null) {
    showError.value = true
    return
  }
  loading.value = true
  await theme.new({
    title: titleRef.value,
    description: descriptionRef.value || undefined,
    categorieId: catId,
  })

  loading.value = false
  refreshValue()
}

watch([theme], ([theme]) => {
  if (theme.newOpen) return

  refreshValue()
})
watch([theme, titleRef, categorieId], () => {
  if (titleRef.value && (categorieId.value || theme.newTheme)) showError.value = false
})
</script>

<template>
  <v-dialog v-model="theme.newOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Nouveau thème</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="titleRef"
            :error-messages="showError && !titleRef ? 'Le titre est obligatoire' : ''"
            label="Titre *"
            required
            variant="outlined"
          />
          <v-textarea v-model="descriptionRef" label="Description" variant="outlined" />
          <v-autocomplete
            v-if="!theme.newTheme?.id"
            v-model="categorieId"
            :error-messages="showError && !categorieId ? 'La catégorie est obligatoire' : ''"
            :items="categorie.list"
            item-text="title"
            item-value="id"
            label="Categorie *"
            variant="outlined"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="() => (theme.newOpen = false)"
        >
          Annuler
        </v-btn>
        <v-btn color="deep-purple-accent-2" variant="text" @click="create" :loading="loading">
          Créer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss"></style>
