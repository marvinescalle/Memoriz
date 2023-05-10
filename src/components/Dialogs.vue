<script setup lang="ts">
import DeleteCarte from "./scripts/carte/Delete.vue"
import EditCarte from "./scripts/carte/Edit.vue"
import NewCarte from "./scripts/carte/New.vue"
import DeleteCategorie from "./scripts/categorie/Delete.vue"
import EditCategorie from "./scripts/categorie/Edit.vue"
import NewCategorie from "./scripts/categorie/New.vue"
import DeleteTheme from "./scripts/theme/Delete.vue"
import EditTheme from "./scripts/theme/Edit.vue"
import NewTheme from "./scripts/theme/New.vue"
</script>

<template>
  <NewCategorie />
  <DeleteCategorie />
  <EditCategorie />

  <NewTheme />
  <DeleteTheme />
  <EditTheme />

  <NewCarte />
  <DeleteCarte />
  <EditCarte />
</template>

<style lang="scss">
.v-dialog .v-overlay__content {
  max-width: 1000px;
  width: 80%;
  .v-card {
    padding: 16px;
  }
}
.carte-title-container {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 8px 16px;
  & > span,
  & > h6 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
}
.carte-description-container {
  padding: 0px 16px 12px 16px;
}
</style>
