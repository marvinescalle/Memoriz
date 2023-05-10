// Utilities
import { defineStore } from "pinia"
import { onMounted, ref } from "vue"

import Categorie from "@/models/categorie"

export const useCategorieStore = defineStore("categorie", () => {
  const loadingRef = ref(true)
  const categoriesRef = ref<Categorie[]>([])
  const newOpenRef = ref(false)

  const deleteRef = ref<Categorie | null>(null)
  const deleteOpenRef = ref(false)

  const editRef = ref<Categorie | null>(null)
  const editOpenRef = ref(false)

  const openNewCategorie = () => {
    newOpenRef.value = true
  }
  const newCategorie = async ({
    title,
    description,
  }: {
    title: string
    description?: string
  }) => {
    const categorie = await Categorie.create({ title, description })
    categoriesRef.value.push(categorie)
    newOpenRef.value = false
  }

  const openDeleteCategorie = (categorie: Categorie) => {
    deleteRef.value = categorie
    deleteOpenRef.value = true
  }
  const deleteCategorie = async (categorie: Categorie) => {
    await categorie.destroy()
    categoriesRef.value = categoriesRef.value.filter((c) => c.id !== categorie.id)
    deleteRef.value = null
    deleteOpenRef.value = false
  }

  const openEditCategorie = (categorie: Categorie) => {
    editRef.value = categorie
    editOpenRef.value = true
  }
  const editCategorie = async (
    categorie: Categorie,
    { title, description }: { title: string; description?: string },
  ) => {
    await categorie.update({ title, description })
    categoriesRef.value = categoriesRef.value.slice()
    editRef.value = null
    editOpenRef.value = false
  }

  onMounted(async () => {
    loadingRef.value = true
    const categories = await Categorie.findAll()
    categoriesRef.value = categories
    loadingRef.value = false
  })

  return {
    loading: loadingRef,
    list: categoriesRef,

    newOpen: newOpenRef,
    openNew: openNewCategorie,
    new: newCategorie,

    deleteCategorie: deleteRef,
    deleteOpen: deleteOpenRef,
    openDelete: openDeleteCategorie,
    delete: deleteCategorie,

    editCategorie: editRef,
    editOpen: editOpenRef,
    openEdit: openEditCategorie,
    edit: editCategorie,
  }
})
