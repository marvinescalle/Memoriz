// Utilities
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"
import { FFprobeWorker } from "ffprobe-wasm"
import { defineStore } from "pinia"
import { onMounted, ref } from "vue"

const worker = new FFprobeWorker()
const maxBitrate = 1000

export const useFfmpegStore = defineStore("ffmpeg", () => {
  const progress = ({ ratio }: { ratio: number }) => (percent.value = ratio * 100)

  const loading = ref(true)
  const ffmpeg = ref(createFFmpeg({ progress }))
  const percent = ref(0)

  const convertVideo = async (file: File) => {
    if (!ffmpeg.value.isLoaded()) await ffmpeg.value.load()
    percent.value = 0
    loading.value = false

    const inputFile = `input.mp4`
    const outputFile = "output.mp4"

    ffmpeg.value.FS("writeFile", inputFile, await fetchFile(file))
    // ffmpeg.value.
    // await ffmpeg.value.run
    const videoBitrate = await worker
      .getFileInfo(file)
      .then((info) => info.streams.find((s) => s.codec_type === "video")?.bit_rate)
      .then((bitrate) =>
        bitrate ? Math.min(Math.floor(parseInt(bitrate) / 1000), maxBitrate) : 0,
      )
    if (!videoBitrate) return null

    const success = await ffmpeg.value
      .run(
        "-i",
        inputFile,
        "-c:v",
        "h264",
        "-b:v",
        `${videoBitrate}k`,
        "-c:a",
        "aac",
        outputFile,
      )
      .then(() => true)
      .catch(() => false)
    if (!success) return null

    const data = ffmpeg.value.FS("readFile", outputFile)
    percent.value = 0
    return data
  }
  const convertAudio = async (file: File) => {
    if (!ffmpeg.value.isLoaded()) await ffmpeg.value.load()
    percent.value = 0
    loading.value = false

    const inputFile = `input.mp3`
    const outputFile = "output.mp3"

    ffmpeg.value.FS("writeFile", inputFile, await fetchFile(file))
    console.log(ffmpeg.value.FS("readdir", "/"))
    await ffmpeg.value.run("-i", inputFile, "-c:a", "mp3", outputFile)

    const data = ffmpeg.value.FS("readFile", "output.mp3")
    percent.value = 0
    return data
  }
  const convertImage = async (file: File) => {
    if (!ffmpeg.value.isLoaded()) await ffmpeg.value.load()
    percent.value = 0
    loading.value = false

    const inputFile = "input.jpg"
    const outputFile = "output.jpg"

    ffmpeg.value.FS("writeFile", inputFile, await fetchFile(file))
    await ffmpeg.value.run("-i", inputFile, outputFile)

    const data = ffmpeg.value.FS("readFile", outputFile)
    percent.value = 0
    return data
  }
  const cancel = async () => {
    if (!ffmpeg.value.isLoaded()) return

    ffmpeg.value.exit()
    loading.value = true

    await ffmpeg.value.load()
    percent.value = 0
    loading.value = false
  }

  onMounted(async () => {
    await ffmpeg.value.load()
    loading.value = false
  })
  return {
    loading,
    percent,
    convertVideo,
    convertAudio,
    convertImage,
    cancel,
  }
})
