// Utilities
import { defineStore } from "pinia"
import { onMounted, ref } from "vue"

import Categorie from "@/models/categorie"
import Theme from "@/models/theme"

export const useThemeStore = defineStore("theme", () => {
  const loadingRef = ref(true)
  const themesRef = ref<Theme[]>([])

  const newRef = ref<Categorie | null>(null)
  const newOpenRef = ref(false)

  const deleteRef = ref<Theme | null>(null)
  const deleteOpenRef = ref(false)

  const editRef = ref<Theme | null>(null)
  const editOpenRef = ref(false)
  const editWithCategorieRef = ref(false)

  const openNewTheme = (categorie?: Categorie) => {
    newRef.value = categorie ?? null
    newOpenRef.value = true
  }
  const newTheme = async ({
    title,
    description,
    categorieId,
  }: {
    title: string
    description?: string
    categorieId: number
  }) => {
    const theme = await Theme.create({ title, description, categorieId })
    themesRef.value.push(theme)
    newOpenRef.value = false
  }

  const openDeleteTheme = (theme: Theme) => {
    deleteRef.value = theme
    deleteOpenRef.value = true
  }
  const deleteTheme = async (theme: Theme) => {
    await theme.destroy()
    themesRef.value = themesRef.value.filter((c) => c.id !== theme.id)
    deleteRef.value = null
    deleteOpenRef.value = false
  }

  const openEditTheme = (theme: Theme, withCategorie?: boolean) => {
    editRef.value = theme
    editOpenRef.value = true
    editWithCategorieRef.value = !!withCategorie
  }
  const editTheme = async (
    theme: Theme,
    {
      title,
      description,
      categorieId,
    }: { title: string; description?: string; categorieId?: number },
  ) => {
    await theme.update({ title, description, categorieId })
    themesRef.value = themesRef.value.slice()
    editRef.value = null
    editOpenRef.value = false
  }

  onMounted(async () => {
    loadingRef.value = true
    const themes = await Theme.findAll()
    themesRef.value = themes
    loadingRef.value = false
  })

  return {
    loading: loadingRef,
    list: themesRef,

    newTheme: newRef,
    newOpen: newOpenRef,
    openNew: openNewTheme,
    new: newTheme,

    deleteTheme: deleteRef,
    deleteOpen: deleteOpenRef,
    openDelete: openDeleteTheme,
    delete: deleteTheme,

    editTheme: editRef,
    editOpen: editOpenRef,
    editWithCategorie: editWithCategorieRef,
    openEdit: openEditTheme,
    edit: editTheme,
  }
})
