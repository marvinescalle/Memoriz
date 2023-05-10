import Carte from "@/models/carte"
import Categorie from "@/models/categorie"
import Theme from "@/models/theme"

export type SelectedType = { themeId: number; index: number; total: number }

export type quizzFormatedCategorie = {
  categorie: Categorie
  themes: {
    theme: Theme
    cartes: {
      selected: Carte[]
      unselected: Carte[]
    }
  }[]
}
