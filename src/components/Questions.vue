<script setup lang="ts">
import { computed, ref } from "vue"

import Carte from "@/models/carte"
import { useCarteStore } from "@/store/cartes"

const carteStore = useCarteStore()
const props = defineProps<{
  cartes: Carte[]
}>()
const emit = defineEmits<{
  (e: "finish", cartes: { correct: Carte[]; failed: Carte[] }): void
}>()

const indexRef = ref(0)
const answerRef = ref(false)

const correctRef = ref<Carte[]>([])
const failedRef = ref<Carte[]>([])

const question = computed(() => {
  const question = props.cartes.at(indexRef.value)
  if (!question) return null

  const rectoMediaType = question.rectoMediaType
  const rectoUrl = question.rectoMedia
    ? URL.createObjectURL(
        new Blob([question.rectoMedia.buffer], { type: rectoMediaType }),
      )
    : null

  const versoMediaType = question.versoMediaType
  const versoUrl = question.versoMedia
    ? URL.createObjectURL(
        new Blob([question.versoMedia.buffer], { type: versoMediaType }),
      )
    : null

  return {
    question,
    rectoUrl,
    versoUrl,
  }
})

const handleSubmit = async (type: "wrong" | "success") => {
  if (!question.value) return
  const carte = question.value.question
  await carteStore.answer(carte, type === "success")

  if (type === "success") correctRef.value.push(carte)
  else failedRef.value.push(carte)

  answerRef.value = false
  if (indexRef.value === props.cartes.length - 1) {
    emit("finish", {
      correct: correctRef.value,
      failed: failedRef.value,
    })
    indexRef.value = 0
    correctRef.value = []
    failedRef.value = []
  } else {
    indexRef.value += 1
  }
}
</script>
<template>
<div class="question-container">
  <div class="question">
    <h6 class="text-h5 font-weight-medium text-center">
      Question {{ indexRef + 1 }} / {{ cartes.length }}
    </h6>
    <v-card variant="tonal" v-if="question">
      <v-card-title class="text-h6">
        {{
          !answerRef
            ? question.question.rectoType === "text"
              ? "Question Texte"
              : question.question.rectoMediaType?.startsWith("video/")
              ? "Question Video"
              : question.question.rectoMediaType?.startsWith("audio/")
              ? "Question Audio"
              : "Question Image"
            : question.question.versoType === "text"
            ? "Réponse Texte"
            : question.question.versoMediaType?.startsWith("video/")
            ? "Réponse Video"
            : question.question.versoMediaType?.startsWith("audio/")
            ? "Réponse Audio"
            : "Réponse Image"
        }}
      </v-card-title>
      <template v-if="!answerRef">
        <v-card-text
          class="text-h6 text-center mt-4"
          v-if="question.question.rectoType === 'text'"
          style="white-space: pre-line"
        >
          {{ question.question.rectoText }}
        </v-card-text>
        <div class="carte-media" v-else-if="question.rectoUrl">
          <video
            controls
            autoplay
            loop
            class="video"
            v-if="question.question.rectoMediaType?.startsWith('video/')"
          >
            <source :src="question.rectoUrl" :type="question.question.rectoMediaType" />
          </video>
          <video
            controls
            autoplay
            class="audio"
            v-else-if="question.question.rectoMediaType?.startsWith('audio/')"
          >
            <source :src="question.rectoUrl" :type="question.question.rectoMediaType" />
          </video>
          <img v-else :src="question.rectoUrl" />
        </div>
      </template>
      <template v-else>
        <v-card-text
          class="text-h6 text-center mt-4"
          v-if="question.question.versoType === 'text'"
          style="white-space: pre-line"
        >
          {{ question.question.versoText }}
        </v-card-text>
        <div class="carte-media" v-else-if="question.versoUrl">
          <video
            controls
            autoplay
            loop
            class="video"
            v-if="question.question.versoMediaType?.startsWith('video/')"
          >
            <source :src="question.versoUrl" :type="question.question.versoMediaType" />
          </video>
          <video
            controls
            autoplay
            loop
            class="audio"
            v-else-if="question.question.versoMediaType?.startsWith('audio/')"
          >
            <source :src="question.versoUrl" :type="question.question.versoMediaType" />
          </video>
          <img v-else :src="question.versoUrl" />
        </div>
      </template>
    </v-card>
    <v-btn
      v-if="!answerRef"
      id="answer-btn"
      size="large"
      @click="answerRef = true"
    >
      Montrer la réponse
    </v-btn>
    <div class="btn-container" v-else>
      <v-btn size="large" @click="() => handleSubmit('wrong')">
        Faux
      </v-btn>
      <v-btn size="large"  @click="() => handleSubmit('success')">
        Juste
      </v-btn>
    </div>
    <v-progress-linear :model-value="indexRef" :max="cartes.length - 1" />
  </div>
  </div>
</template>
<style scoped lang="scss">
.question-container { 
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
}
.question {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: 16px;
  #answer-btn,
  .btn-container {
    align-self: center;
    margin-block: 16px;
  }
  .btn-container {
    display: flex;
    justify-content: center;
    column-gap: 16px;
  }
  .v-card {
    margin-inline: 24px;
    padding: 24px 48px;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    @media (max-width: 600px) {
      margin-inline: 0;
    }
    .carte-media {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-block: 16px;
      img {
        width: 50%;
        max-height: 40vh;
        object-fit: contain;
        @media (max-width: 600px) {
          max-height: 70vh;
          width: 100%;
        }
      }
      video.audio {
        height: 54px;
        width: 80%;
      }
      video.video {
        width: 80%;
        max-height: 40vh;
        object-fit: contain;
      }
    }
  }
}
</style>
