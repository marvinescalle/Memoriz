// Utilities
import { defineStore } from "pinia"
import { computed, onMounted, ref } from "vue"

import carte from "@/models/carte"
import Categorie from "@/models/categorie"
import Theme from "@/models/theme"
import { CartesByCategorie } from "@/types/cartes"

export const useCarteStore = defineStore("carte", () => {
  const loadingRef = ref(true)
  const cartesRef = ref<carte[]>([])

  const newRef = ref<Theme | null>(null)
  const newOpenRef = ref(false)

  const deleteRef = ref<carte | null>(null)
  const deleteOpenRef = ref(false)

  const editRef = ref<carte | null>(null)
  const editOpenRef = ref(false)
  const editWithThemeRef = ref(false)

  const openNewCarte = (theme?: Theme) => {
    newRef.value = theme ?? null
    newOpenRef.value = true
  }
  const newCarte = async (carte: carte) => {
    await carte.refresh({ includes: [{ model: Theme, includes: [Categorie] }] })
    cartesRef.value.push(carte)
    newOpenRef.value = false
  }

  const openDeleteCarte = (carte: carte) => {
    deleteRef.value = carte
    deleteOpenRef.value = true
  }
  const deleteCarte = async (carte: carte) => {
    await carte.destroy()
    cartesRef.value = cartesRef.value.filter((c) => c.id !== carte.id)
    deleteRef.value = null
    deleteOpenRef.value = false
  }

  const openEditCarte = (carte: carte, withTheme?: boolean) => {
    editRef.value = carte
    editOpenRef.value = true
    editWithThemeRef.value = !!withTheme
  }
  const editCarte = async () => {
    editRef.value?.refresh({ includes: [{ model: Theme, includes: [Categorie] }] })
    cartesRef.value = cartesRef.value.slice()
    editRef.value = null
    editOpenRef.value = false
  }

  const answerCarte = async (carte: carte, correct: boolean) => {
    if (correct) {
      await carte.update({
        streak: carte.streak ? carte.streak + 1 : 1,
        lastStreak: new Date(),
      })
    } else {
      await carte.update({
        streak: 0,
        lastStreak: new Date(),
      })
    }
    await carte.refresh({ includes: [{ model: Theme, includes: [Categorie] }] })
    cartesRef.value = cartesRef.value.slice()
  }

  const cartesByCategories = computed(() => {
    const now = new Date().getTime()
    return cartesRef.value
      .reduce((r: CartesByCategorie[], carte) => {
        const streakTime = !carte.streak
          ? 0
          : Math.pow(2, carte.streak - 1) * 24 * 3600 * 1000
        const isToReview =
          !carte.lastStreak || !carte.streak || now - carte.lastStreak.getTime() > streakTime
        const index = r.findIndex((f) => f.categorie.id === carte.theme?.categorieId)
        if (index >= 0) {
          const themeIndex = r[index].themes.findIndex((f) => f.theme.id === carte.themeId)
          if (themeIndex >= 0) {
            if (isToReview)
              r[index].themes[themeIndex].cartes.toReview.push({ carte, streakTime })
            else r[index].themes[themeIndex].cartes.anticipated.push({ carte, streakTime })
          } else {
            r[index].themes.push({
              theme: carte.theme,
              cartes: {
                toReview: isToReview ? [{ carte, streakTime }] : [],
                anticipated: !isToReview ? [{ carte, streakTime }] : [],
              },
            })
          }
        } else {
          r.push({
            categorie: carte.theme.categorie,
            themes: [
              {
                theme: carte.theme,
                cartes: {
                  toReview: isToReview ? [{ carte, streakTime }] : [],
                  anticipated: !isToReview ? [{ carte, streakTime }] : [],
                },
              },
            ],
          })
        }
        return r
      }, [])
      .map((categorie) => {
        return {
          ...categorie,
          themes: categorie.themes
            .sort((a, b) =>
              a.theme.title.toLowerCase().localeCompare(b.theme.title.toLowerCase()),
            )
            .map((theme) => {
              const cartes = [
                ...theme.cartes.toReview.sort((a, b) => a.streakTime - b.streakTime),
                ...theme.cartes.anticipated.sort((a, b) => a.streakTime - b.streakTime),
              ]
              return {
                ...theme,
                cartes,
                toReviewCount: theme.cartes.toReview.length,
              }
            }),
        }
      })
      .sort((a, b) =>
        a.categorie.title.toLowerCase().localeCompare(b.categorie.title.toLowerCase()),
      )
  })
  const cartesToReview = computed(() => {
    return cartesByCategories.value.flatMap((categorie) =>
      categorie.themes.flatMap((theme) => theme.cartes.slice(0, theme.toReviewCount)),
    )
  })
  const cartesToReviewCount = computed(() => {
    return cartesToReview.value.length
  })

  onMounted(async () => {
    loadingRef.value = true
    const cartes = await carte.findAll({
      includes: [
        {
          model: Theme,
          includes: [Categorie],
        },
      ],
    })
    cartesRef.value = cartes
    loadingRef.value = false
  })

  return {
    loading: loadingRef,
    list: cartesRef,
    listByCategories: cartesByCategories,
    toReview: cartesToReview,
    toReviewCount: cartesToReviewCount,

    answer: answerCarte,

    newCarte: newRef,
    newOpen: newOpenRef,
    openNew: openNewCarte,
    new: newCarte,

    deleteCarte: deleteRef,
    deleteOpen: deleteOpenRef,
    openDelete: openDeleteCarte,
    delete: deleteCarte,

    editCarte: editRef,
    editOpen: editOpenRef,
    openEdit: openEditCarte,
    edit: editCarte,
    editWithTheme: editWithThemeRef,
  }
})
