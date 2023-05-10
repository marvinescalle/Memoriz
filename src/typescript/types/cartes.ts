import Carte from "@/models/carte"
import Categorie from "@/models/categorie"
import Theme from "@/models/theme"

export interface MediaInterface {
  data: Uint8Array
  url: string
  type: string
  name: string
}

export interface CartesByCategorie {
  categorie: Categorie
  themes: {
    theme: Theme
    cartes: {
      toReview: { carte: Carte; streakTime: number }[]
      anticipated: { carte: Carte; streakTime: number }[]
    }
  }[]
}
