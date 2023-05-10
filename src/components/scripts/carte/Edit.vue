<script setup lang="ts">
import { ref, watch } from "vue"

import Depos from "@/components/Depos.vue"
import { useCarteStore } from "@/store/cartes"
import { useFfmpegStore } from "@/store/ffmpeg"
import { useThemeStore } from "@/store/theme"
import { MediaInterface } from "@/store/cartes"

const theme = useThemeStore()
const carte = useCarteStore()
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
  rectoType.value = "Texte"
  rectoContent.value = ""
  rectoMedia.value = null
  versoType.value = "Texte"
  versoContent.value = ""
  versoMedia.value = null
  themeId.value = null
  showError.value = false
  convertingType.value = null
  ffmpeg.cancel()
}
const edit = async () => {
  if (!carte.editCarte) return
  if (
    !title.value ||
    convertingType.value ||
    (rectoType.value === "Texte" && !rectoContent.value) ||
    (rectoType.value === "Fichier" && !rectoMedia.value) ||
    (versoType.value === "Texte" && !versoContent.value) ||
    (versoType.value === "Fichier" && !versoMedia.value) ||
    (carte.editWithTheme && themeId.value === null)
  ) {
    showError.value = true
    return
  }
  loading.value = true

  await carte.editCarte.update({
    title: title.value,
    ...(rectoType.value === "Texte"
      ? {
          rectoType: "text",
          rectoText: rectoContent.value,
          rectoMedia: undefined,
          rectoMediaType: undefined,
          rectoMediaAlt: undefined,
        }
      : {
          rectoType: "media",
          rectoText: undefined,
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
    themeId: themeId.value ?? carte.editCarte.themeId,
  })
  await carte.edit()

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
  showError.value = false
  if (carte.editOpen) {
    title.value = carte.editCarte?.title || ""

    rectoType.value = carte.editCarte?.rectoType === "media" ? "Fichier" : "Texte"
    rectoContent.value = carte.editCarte?.rectoText || ""
    if (carte.editCarte?.rectoMedia) {
      const url = URL.createObjectURL(
        new Blob([carte.editCarte.rectoMedia], { type: carte.editCarte.rectoMediaType }),
      )
      rectoMedia.value = {
        data: carte.editCarte.rectoMedia,
        type: carte.editCarte.rectoMediaType!,
        name: carte.editCarte.rectoMediaAlt!,
        url,
      }
    } else rectoMedia.value = null

    versoType.value = carte.editCarte?.versoType === "media" ? "Fichier" : "Texte"
    versoContent.value = carte.editCarte?.versoText || ""
    if (carte.editCarte?.versoMedia) {
      const url = URL.createObjectURL(
        new Blob([carte.editCarte.versoMedia], { type: carte.editCarte.versoMediaType }),
      )
      versoMedia.value = {
        data: carte.editCarte.versoMedia,
        type: carte.editCarte.versoMediaType!,
        name: carte.editCarte.versoMediaAlt!,
        url,
      }
    } else rectoMedia.value = null
    themeId.value = carte.editCarte?.themeId ?? null
  } else refreshValue()
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
        (versoType.value === "Fichier" && versoMedia.value))
    )
      showError.value = false
  },
)
</script>

<template>
  <v-dialog v-model="carte.editOpen">
    <v-card class="dialog">
      <v-card-title>
        <span class="text-h5">Éditer la carte</span>
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
            v-if="carte.editWithTheme"
            v-model="themeId"
            :error-messages="showError && !themeId ? 'Le thème est obligatoire' : ''"
            :items="theme.list"
            item-text="title"
            item-value="id"
            label="Thème *"
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
                        ? 'Le contenu est obligatoire'
                        : ''
                      : convertingType === 'recto'
                      ? 'Wait for conversion'
                      : !rectoMedia
                      ? 'Le fichier est obligatoire'
                      : ''
                    : ''
                "
                label="Recto"
                variant="outlined"
              />
              <div :class="`dropzone-container ${rectoType === 'Fichier' ? 'active' : ''}`">
                <Depos
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
                        ? 'Le contenu est obligatoire'
                        : ''
                      : convertingType === 'verso'
                      ? 'Wait for conversion'
                      : !versoMedia
                      ? 'Le fichier est obligatoire'
                      : ''
                    : ''
                "
                label="Verso"
                variant="outlined"
              />
              <div :class="`dropzone-container ${versoType === 'Fichier' ? 'active' : ''}`">
                <Depos
                  @file-change="($file) => onMediaChange('verso', $file)"
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
        <v-btn
          color="deep-purple-accent-2"
          variant="text"
          @click="() => (carte.editOpen = false)"
        >
          Annuler
        </v-btn>
        <v-btn color="deep-purple-accent-2" variant="text" @click="edit" :loading="loading">
          Éditer
        </v-btn>
      </v-card-actions>
    </v-card></v-dialog
  >
</template>

<style lang="scss" scoped>
*{
  color: #8c61ff;
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
