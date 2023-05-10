import Carte from "./carte"
import Categorie from "./categorie"
import Theme from "./theme"
import { Database } from "./utils/database"

const database = new Database("main", 0.2)

database.addModels([Categorie, Theme, Carte])

export default database
