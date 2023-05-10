import Theme from "./theme"
import { Column } from "./utils/column"
import { Model } from "./utils/model/model"
import { BelongsTo, ForeignKey } from "./utils/relation"
import { Table } from "./utils/table"

@Table({
  name: "cartes",
})
class Carte extends Model {
  @Column()
  declare title: string

  @Column()
  declare rectoType: "text" | "media"
  @Column()
  declare rectoText?: string
  @Column()
  declare rectoMedia?: Uint8Array
  @Column()
  declare rectoMediaType?: string
  @Column()
  declare rectoMediaAlt?: string

  @Column()
  declare versoType: "text" | "media"
  @Column()
  declare versoText?: string
  @Column()
  declare versoMedia?: Uint8Array
  @Column()
  declare versoMediaType?: string
  @Column()
  declare versoMediaAlt?: string

  @Column()
  declare streak: number
  @Column()
  declare lastStreak?: Date

  @ForeignKey(() => Theme)
  @Column()
  declare themeId: number
  @BelongsTo(() => Theme)
  declare theme: Theme
}

export default Carte
