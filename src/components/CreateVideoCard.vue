<script setup lang="ts">
import { computed, ref } from "vue"

import { useFfmpegStore } from "@/store/ffmpeg"

const ffmpeg = useFfmpegStore()

const loading = ref(false)

const title = ref("Test titre")

const videos = ref<File[]>([])
const video = computed(() => videos.value.at(0) ?? null)

const createCarte = async () => {
  if (!video.value) return
  if (!title.value) return

  loading.value = true
  const data = await ffmpeg.convertVideo(video.value)
  console.log(data)
}
</script>

<template>
  <v-container>
    <h1>Create Video Carte</h1>
    <v-text-field prepend-icon="mdi-text" label="Titre" v-model="title" />
    <v-file-input
      label="Video"
      prepend-icon="mdi-video"
      v-model="videos"
      accept="video/*"
      show-size
    />
    <v-progress-linear :model-value="ffmpeg.percent" v-if="!!ffmpeg.percent" />
    <v-btn
      width="100%"
      color="primary"
      :loading="loading || ffmpeg.loading"
      @click="createCarte"
    >
      Créer</v-btn
    >
  </v-container>
</template>
