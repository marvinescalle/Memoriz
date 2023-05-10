import Categorie from "./categorie"
import { Column } from "./utils/column"
import { Model } from "./utils/model/model"
import { BelongsTo, ForeignKey } from "./utils/relation"
import { Table } from "./utils/table"

@Table({
  name: "themes",
})
class Theme extends Model {
  @Column()
  declare title: string

  @Column()
  declare description?: string

  @ForeignKey(() => Categorie)
  @Column()
  declare categorieId: number

  @BelongsTo(() => Categorie)
  declare categorie: Categorie
}

export default Theme
