<script lang="ts" setup>
import { useCarteStore } from "@/store/cartes"

const carteStore = useCarteStore()
</script>

<template>
  <div class="container mt-4 mt-md-8 mt-lg-12 mt-xl-16">
    <h3 class="text-h4 font-weight-medium">Mémoriz tes cartes !</h3>
    <template v-if="carteStore.loading">
      <div class="d-flex justify-center mt-2">
        <v-progress-circular indeterminate color="deep-purple-accent-2"></v-progress-circular>
      </div>
    </template>
    <template v-else>
      <div class="button-container d-flex justify-center mt-4 mt-md-6 mt-lg-8">
        <v-btn
          class="round-button mr-4"
          variant="tonal"
          color="#8b61ff75"
          size="x-large"
          to="/cartes"
        >
          Créer une carte
        </v-btn>
        <v-btn
          class="round-button"
          variant="tonal"
          color="#8b61ff75"
          size="x-large"
          to="/quizz"
        >
          Commencer à réviser
        </v-btn>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
h3 {
  color: #8c61ff;
  text-align: center;
}
.container {
  margin: 0 auto;
  max-width: 800px;
  width: 80%;
}
.button-container {
  width: 100%;
}
.round-button {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>