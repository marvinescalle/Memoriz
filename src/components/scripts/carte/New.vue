<script setup lang="ts">
import { ref, watch } from "vue"

import Dropzone from "@/components/Dropzone.vue"
import Carte from "@/models/carte"
import { useCarteStore } from "@/store/cartes"
import { useFfmpegStore } from "@/store/ffmpeg"
import { useThemeStore } from "@/store/theme"
import { MediaInterface } from "@/types/cartes"

const carte = useCarteStore()
const theme = useThemeStore()
const ffmpeg = useFfmpegStore()

const title = ref("")
const themeId = ref<number | null>(null)
const loading = ref(false)
const showError = ref(false)

const convertingType = ref<"recto" | "verso" | null>(null)

const rectoType = ref("Texte")
const rectoContent = ref("")
const rectoMedia = ref<MediaInterface | null>(null)

const versoType = ref("Texte")
const versoContent = ref("")
const versoMedia = ref<MediaInterface | null>(null)

const refreshValue = () => {
  title.value = ""
  themeId.value = null
  rectoType.value = "Texte"
  rectoContent.value = ""
  rectoMedia.value = null
  versoType.value = "Texte"
  versoContent.value = ""
  versoMedia.value = null
  showError.value = false
  convertingType.value = null
  ffmpeg.cancel()
}
const create = async () => {
  const themId = carte.newCarte?.id ?? themeId.value
  if (
    !title.value ||
    convertingType.value ||
    (rectoType.value === "Texte" && !rectoContent.value) ||
    (rectoType.value === "Fichier" && !rectoMedia.value) ||
    (versoType.value === "Texte" && !versoContent.value) ||
    (versoType.value === "Fichier" && !versoMedia.value) ||
    themId === null
  ) {
    showError.value = true
    return
  }
  loading.value = true

  const c = await Carte.create({
    title: title.value,
    ...(rectoType.value === "Texte"
      ? {
          rectoType: "text",
          rectoText: rectoContent.value,
        }
      : {
          rectoType: "media",
          rectoMedia: rectoMedia.value!.data,
          rectoMediaType: rectoMedia.value!.type,
          rectoMediaAlt: rectoMedia.value!.name,
        }),
    ...(versoType.value === "Texte"
      ? {
          versoType: "text",
          versoText: versoContent.value,
        }
      : {
          versoType: "media",
          versoMedia: versoMedia.value!.data,
          versoMediaType: versoMedia.value!.type,
          versoMediaAlt: versoMedia.value!.name,
        }),
    streak: 0,
    themeId: themId,
  })
  await carte.new(c)

  loading.value = false
  refreshValue()
}
const onMediaChange = async (type: "recto" | "verso", file: File) => {
  if (convertingType.value) return

  convertingType.value = type
  const fileType = file.type.split("/")[0]

  if (fileType === "image") {
    const data = await new Promise<Uint8Array>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(new Uint8Array(reader.result as ArrayBuffer))
      }
      reader.readAsArrayBuffer(file)
    })
    const url = URL.createObjectURL(new Blob([data.buffer], { type: file.type }))
    const mediaData = { data, type: file.type, name: file.name, url }
    if (type === "recto") rectoMedia.value = mediaData
    else versoMedia.value = mediaData
  } else {
    const data =
      fileType === "audio"
        ? await ffmpeg.convertAudio(file)
        : await ffmpeg.convertVideo(file)
    if (!data) return (convertingType.value = null)

    const mediaType = fileType === "video" ? "video/mp4" : "audio/mp3"
    const url = URL.createObjectURL(new Blob([data.buffer], { type: mediaType }))
    const mediaData = { data, type: mediaType, name: file.name, url }
    if (type === "recto") rectoMedia.value = mediaData
    else versoMedia.value = mediaData
  }

  convertingType.value = null
}

watch([carte], ([carte]) => {
  if (carte.newOpen) return

  refreshValue()
})
watch(
  [title, rectoType, rectoContent, rectoMedia, versoType, versoContent, versoMedia],
  () => {
    if (
      title.value &&
      !convertingType.value &&
      ((rectoType.value === "Texte" && rectoContent.value) ||
        (rectoType.value === "Fichier" && rectoMedia.value)) &&
      ((versoType.value === "Texte" && versoContent.value) ||
        (versoType.value === "Fichier" && versoMedia.value)) &&
      (themeId.value || carte.newCarte)
    )
      showError.value = false
  },
)
</script>

<template>
  <v-dialog v-model="carte.newOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Nouvelle carte</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="title"
            :error-messages="showError && !title ? 'Le titre est obligatoire' : ''"
            label="Titre *"
            required
            variant="outlined"
          />
          <v-autocomplete
            v-if="!carte.newCarte?.id"
            v-model="themeId"
            :error-messages="showError && !themeId ? 'Le thème est obligatoire' : ''"
            :items="theme.list"
            item-text="title"
            item-value="id"
            label="Thème"
            variant="outlined"
          />
        </v-form>
        <div class="carte-sides">
          <div class="carte-side">
            <h6
              class="text-body-1 text-sm-h6 mb-2 mb-sm-1 font-weight-regular text-center"
            >
              Recto
            </h6>
            <v-select
              label="Type"
              :items="['Texte', 'Fichier']"
              variant="outlined"
              v-model="rectoType"
            />
            <div class="carte-content">
              <v-textarea
                v-model="rectoContent"
                :error-messages="
                  showError
                    ? rectoType === 'Texte'
                      ? !rectoContent
                        ? 'Content is required'
                        : ''
                      : convertingType === 'recto'
                      ? 'Wait for conversion'
                      : !rectoMedia
                      ? 'Fichier is required'
                      : ''
                    : ''
                "
                label="Recto"
                variant="outlined"
              />
              <div :class="`dropzone-container ${rectoType === 'Fichier' ? 'active' : ''}`">
                <Dropzone
                  @file-change="($file) => onMediaChange('recto', $file)"
                  :error="showError && (convertingType === 'recto' || !rectoMedia)"
                  :disabled="!!convertingType"
                  :disabled-text="
                    convertingType === 'recto'
                      ? 'Converting...'
                      : 'Other side is converting...'
                  "
                  :percent="convertingType === 'recto' ? ffmpeg.percent : undefined"
                  :media="rectoMedia"
                />
              </div>
            </div>
          </div>
          <div class="carte-side">
            <h6
              class="text-body-1 text-sm-h6 mb-2 mb-sm-1 font-weight-regular text-center"
            >
              Verso
            </h6>
            <v-select
              label="Type"
              :items="['Texte', 'Fichier']"
              variant="outlined"
              v-model="versoType"
            />
            <div class="carte-content">
              <v-textarea
                v-model="versoContent"
                :error-messages="
                  showError
                    ? versoType === 'Texte'
                      ? !versoContent
                        ? 'Content is required'
                        : ''
                      : convertingType === 'verso'
                      ? 'Wait for conversion'
                      : !versoMedia
                      ? 'Fichier is required'
                      : ''
                    : ''
                "
                label="Verso"
                variant="outlined"
              />
              <div :class="`dropzone-container ${versoType === 'Fichier' ? 'active' : ''}`">
                <Dropzone
                  @file-change="($file) => onMediaChange('verso', $file)"
                  :error="showError && (convertingType === 'verso' || !versoMedia)"
                  :disabled="!!convertingType"
                  :disabled-text="
                    convertingType === 'verso'
                      ? 'Converting...'
                      : 'Other side is converting...'
                  "
                  :percent="convertingType === 'verso' ? ffmpeg.percent : undefined"
                  :media="versoMedia"
                />
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="deep-purple-accent-2" variant="text" @click="() => (carte.newOpen = false)">
          Annuler
        </v-btn>
        <v-btn color="deep-purple-accent-2" variant="text" @click="create" :loading="loading">
          Créer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss" scoped>
*{
  color:  #8c61ff;
}
.carte-sides {
  display: flex;
  column-gap: 32px;
  @media (max-width: 600px) {
    column-gap: 16px;
  }
  .carte-side {
    flex: 1;
    .carte-content {
      position: relative;
      .dropzone-container {
        position: absolute;
        top: 0;
        left: 0;
        height: calc(100% - 22px);
        width: 100%;
        background: #fff;
        visibility: hidden;
        opacity: 0;
        &.active {
          visibility: visible;
          opacity: 1;
        }
      }
    }
  }
}
</style>
