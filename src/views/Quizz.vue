<script setup lang="ts">
import { computed, ref, watchEffect } from "vue"

import Questions from "@/components/Questions.vue"
import Carte from "@/models/carte"
import { useCarteStore } from "@/store/cartes"
import { SelectedType, quizzFormatedCategorie } from "@/types/quizz"
import { shuffleArray } from "@/utils/array"

const carteStore = useCarteStore()

const selectedRef = ref<SelectedType[]>([])
const selectedCartes = ref<Carte[] | null>(null)

const finishRef = ref(false)
const correctCartes = ref<Carte[]>([])
const wrongCartes = ref<Carte[]>([])

const formatedCategories = computed(() => {
  return carteStore.listByCategories.map(({ categorie, themes }): quizzFormatedCategorie => {
    return {
      categorie,
      themes: themes
        .map(({ theme, cartes }) => {
          const selected = selectedRef.value.find(({ themeId }) => themeId === theme.id)
          if (!selected) return null
          const selectedCartes = cartes
            .slice(0, selected.index)
            .sort((a, b) => a.streakTime - b.streakTime)
            .map(({ carte }) => carte)
          const unselectedCartes = cartes
            .slice(selected.index)
            .sort((a, b) => a.streakTime - b.streakTime)
            .map(({ carte }) => carte)
          return {
            theme,
            cartes: {
              selected: selectedCartes,
              unselected: unselectedCartes,
            },
          }
        })
        .filter(Boolean),
    }
  })
})
const submitDisabled = computed(() => {
  return !formatedCategories.value.flatMap(({ themes }) =>
    themes.flatMap(({ cartes }) => cartes.selected),
  ).length
})

const handleChangeCount = (themeId: number, type: "minus" | "plus") => {
  const selected = selectedRef.value.find((theme) => theme.themeId === themeId)
  if (!selected) return

  const index = selected.index + (type === "minus" ? -1 : 1)
  if (index < 0 || index > selected.total) return

  selected.index = index
}
const handleSubmit = () => {
  const cartes = formatedCategories.value.flatMap(({ themes }) =>
    themes.flatMap(({ cartes }) => cartes.selected),
  )
  const shuffledCartes = shuffleArray(cartes)
  selectedCartes.value = shuffledCartes
}
const handleFinish = ({ correct, failed }: { correct: Carte[]; failed: Carte[] }) => {
  correctCartes.value = correct
  wrongCartes.value = failed
  finishRef.value = true
}

watchEffect(() => {
  selectedRef.value = carteStore.listByCategories.reduce((r: SelectedType[], categorie) => {
    return [
      ...r,
      ...categorie.themes.map(
        ({ theme, toReviewCount, cartes }): SelectedType => ({
          themeId: theme.id,
          index: toReviewCount,
          total: cartes.length,
        }),
      ),
    ]
  }, [])
})
</script>

<template>
  <div class="container mt-4 mt-md-8 mt-lg-12 mt-xl-16">
    <template v-if="finishRef">
      <v-btn to="/" class="text-subtitle-1" :active="false">Menu</v-btn>  
      <h3 class="text-h4 font-weight-medium">
        Score: {{ correctCartes.length }} / {{ selectedCartes?.length }}
      </h3>
    </template>
    <Questions v-else-if="selectedCartes" :cartes="selectedCartes" @finish="handleFinish" />
    <template v-else>
      <div class="categorie-list">
        <div v-for="categorie in formatedCategories" v-bind:key="categorie.categorie.id">
          <h4 class="text-h5 font-weight-medium">{{ categorie.categorie.title }}</h4>
          <ul class="theme-list">
            <li v-for="theme in categorie.themes" v-bind:key="theme.theme.id">
              <h6 class="text-h6 font-weight-regular">{{ theme.theme.title }}</h6>
              <div class="selection-container">
                <v-btn
                  class="custom-btn"
                  size="small"
                  icon
                  variant="text"
                  @click="() => handleChangeCount(theme.theme.id, 'minus')"
                >
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <span>
                  {{ theme.cartes.selected.length }} /
                  {{ theme.cartes.selected.length + theme.cartes.unselected.length }}
                </span>
                <v-btn
                  class="custom-btn"
                  size="small"
                  icon
                  variant="text"
                  @click="() => handleChangeCount(theme.theme.id, 'plus')"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </li>
          </ul>
        </div>
        <v-btn
          class="mt-4 mt-md-8 custom-btn"
          size="large"
          @click="handleSubmit"
          :disabled="submitDisabled"
        >
          Commencer
        </v-btn>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;500;700&display=swap');

.container {
  margin: 0 auto;
  max-width: 800px;
  width: 80%;
  font-family: 'Roboto Slab', serif;
}
.categorie-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  & > div {
    h4 {
      margin-bottom: 12px;
      text-decoration: underline;
      color: #8c61ff;
    }
    .theme-list {
      display: flex;
      flex-direction: column;
      list: none;
margin-left: 32px;
row-gap: 8px;
& > li {
  position: relative;
display: flex;
justify-content: space-between;
align-items: center;
color: #8c61ff;
&::before {
  position: absolute;
content: "";
left: -8px;
top: 50%;
transform: translateY(-50%) translateX(-100%);
height: 6px;
width: 6px;
border-radius: 50%;
background: #8c61ff;
}
.selection-container {
  display: flex;
align-items: center;
column-gap: 8px;
}
}
}
}
}

.custom-btn {
  background-color: #8b61ff60;
color: white;
border-radius: 50px;
&:hover {
  background-color: darken(#8b61ff60, 10%);
}
&:disabled {
  background-color: #8c61ff75;
cursor: not-allowed;
}
}
</style>
