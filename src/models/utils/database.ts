import Dexie from "dexie"

import { Model } from "./model/model"

export class Database {
  private db: Dexie
  private version = 0.1
  private models: Record<string, string> = {}

  constructor(name: string, version?: number) {
    this.db = new Dexie(name)
    this.version = version ?? this.version
  }

  public addModels(models: { new (): Model }[]) {
    models.map((model) => {
      if (!model.prototype._tableName || !model.prototype._columns) return

      const tableString = `++id,${model.prototype._columns.join(",")},createdAt,updatedAt`
      this.models[model.prototype._tableName] = tableString
      model.prototype._db = this.db
    })
  }
  public async init() {
    this.db.version(this.version).stores(this.models)
    await this.db.open().catch((err) => console.error(err.stack ?? err))
  }
}
