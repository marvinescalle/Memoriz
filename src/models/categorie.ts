import Theme from "./theme"
import { Column } from "./utils/column"
import { Model } from "./utils/model/model"
import { HasMany } from "./utils/relation"
import { Table } from "./utils/table"

@Table({
  name: "categories",
})
class Categorie extends Model {
  @Column()
  declare title: string

  @Column()
  declare description?: string

  @HasMany(() => Theme)
  declare themes: Theme[]
}

export default Categorie
