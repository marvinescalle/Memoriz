import Dexie from "dexie"

import {
  CollectionType,
  CreateAttributes,
  FindOptions,
  IncludeAttributes,
  ModelStatic,
  TableType,
  UpdateAttributes,
  WhereAttributes,
} from "./types"

const getTableInstance = <M extends Model>(self: ModelStatic<M>): TableType => {
  const db = self.prototype._db as Dexie
  if (!db) throw new Error(`Model ${self.name} not initialized with database.`)
  return db.table(self.prototype._tableName)
}
const asignModel = <M extends Model>(self: ModelStatic<M>, data: any) => {
  const instance = new self()
  Object.assign(instance, data)
  return instance
}
const getWhereCollecition = <M extends Model>(
  table: TableType,
  where?: WhereAttributes<M> | undefined,
): CollectionType => {
  let collection: CollectionType | null = null
  if (where) {
    if ("$or" in where && Array.isArray(where.$or)) {
      // where.$or.map()
    } else {
      Object.keys(where).map((k) => {
        const key = k as keyof typeof where
        const value = where[key]
        if (!value) return

        if (
          typeof value === "string" ||
          (typeof value === "object" &&
            ("$include" in value || "$startsWith" in value || "$endsWith" in value))
        ) {
          if (typeof value === "string") {
            if (!collection) collection = table.where(key).equalsIgnoreCase(value)
            else
              collection.and((row) =>
                row[key].toLowerCase().includes(value.toLowerCase()),
              )
          } else {
            if (value.$include) {
              if (!collection)
                collection = table.filter((row) =>
                  row[key].toLowerCase().includes(value.$include!.toLowerCase()),
                )
              else
                collection.and((row) =>
                  row[key].toLowerCase().includes(value.$include!.toLowerCase()),
                )
            }
            if (value.$startsWith) {
              if (!collection)
                collection = table.where(key).startsWithIgnoreCase(value.$startsWith)
              else
                collection.and((row) =>
                  row[key].toLowerCase().startsWith(value.$startsWith!.toLowerCase()),
                )
            }
            if (value.$endsWith) {
              if (!collection)
                collection = table.filter((row) =>
                  row[key].toLowerCase().endsWith(value.$endsWith!.toLowerCase()),
                )
              else
                collection.and((row) =>
                  row[key].toLowerCase().endsWith(value.$endsWith!.toLowerCase()),
                )
            }
          }
        } else if (
          value instanceof Date ||
          (typeof value === "object" &&
            ("$gt" in value || "$gte" in value || "$lt" in value || "$lte" in value) &&
            (value["$gt"] instanceof Date ||
              value["$gte"] instanceof Date ||
              value["$lt"] instanceof Date ||
              value["$lte"] instanceof Date))
        ) {
          if (value instanceof Date) {
            if (!collection) collection = table.where(key).equals(value)
            else collection.and((row) => row[key] === value)
          } else {
            if (value.$gt) {
              if (!collection) collection = table.where(key).above(value.$gt)
              else collection.and((row) => row[key] > value.$gt!)
            }
            if (value.$gte) {
              if (!collection) collection = table.where(key).aboveOrEqual(value.$gte)
              else collection.and((row) => row[key] >= value.$gte!)
            }
            if (value.$lt) {
              if (!collection) collection = table.where(key).below(value.$lt)
              else collection.and((row) => row[key] < value.$lt!)
            }
            if (value.$lte) {
              if (!collection) collection = table.where(key).belowOrEqual(value.$lte)
              else collection.and((row) => row[key] <= value.$lte!)
            }
          }
        } else if (
          typeof value === "number" ||
          (typeof value === "object" &&
            ("$gt" in value || "$gte" in value || "$lt" in value || "$lte" in value))
        ) {
          if (typeof value === "number") {
            if (!collection) collection = table.where(key).equals(value)
            else collection.and((row) => row[key] === value)
          } else {
            if (value.$gt) {
              if (!collection) collection = table.where(key).above(value.$gt)
              else collection.and((row) => row[key] > value.$gt!)
            }
            if (value.$gte) {
              if (!collection) collection = table.where(key).aboveOrEqual(value.$gte)
              else collection.and((row) => row[key] >= value.$gte!)
            }
            if (value.$lt) {
              if (!collection) collection = table.where(key).below(value.$lt)
              else collection.and((row) => row[key] < value.$lt!)
            }
            if (value.$lte) {
              if (!collection) collection = table.where(key).belowOrEqual(value.$lte)
              else collection.and((row) => row[key] <= value.$lte!)
            }
          }
        }
      })
    }
    // collection = table.where()
  }

  if (!collection) collection = table.toCollection()
  return collection
}
const includesRelations = async <M extends Model>(
  self: M,
  relationsClass: IncludeAttributes,
) => {
  const prototype = (self.constructor as ModelStatic<M>).prototype
  const selfTableName = prototype._tableName

  const foreignKeys = Object.keys(prototype._foreignKey || {})
    .map((key) => {
      if (!prototype._foreignKey || !prototype._foreignKey[key]) return
      const foreignKey = prototype._foreignKey[key]() as ModelStatic<Model>
      const tableName = foreignKey.prototype._tableName
      return {
        key,
        tableName,
      }
    })
    .filter(Boolean)
  const belongsTo = prototype._belongsTo || {}
  const hasMany = prototype._hasMany || {}
  const hasOne = prototype._hasOne || {}

  const belongsToKeys = Object.keys(belongsTo)
  const hasManyKeys = Object.keys(hasMany)
  const hasOneKeys = Object.keys(hasOne)

  const relations = relationsClass.map((relation) => {
    const model = "model" in relation ? relation.model : relation
    const includes = "includes" in relation ? relation.includes ?? null : null
    return {
      name: model.prototype._tableName,
      model,
      includes,
    }
  })

  await Promise.all(
    belongsToKeys.map(async (key) => {
      const belongsToClass: ModelStatic<Model> = belongsTo[key]()
      const table = getTableInstance(belongsToClass)
      const tableName = belongsToClass.prototype._tableName

      const relation = relations.find(({ name }) => name === tableName)
      if (!relation) return

      const foreignKey = foreignKeys.find((key) => key.tableName === tableName)
      if (!foreignKey) return

      const primaryKey = Object.entries(self).find(
        ([key]) => key === foreignKey?.key,
      )?.[1]
      if (!primaryKey || typeof primaryKey !== "number") return

      const modelData = await table.get(primaryKey)
      const model = modelData ? await asignModel(belongsToClass, modelData) : null
      if (model && relation.includes) await includesRelations(model, relation.includes)
      Object.assign(self, { [key]: model })
    }),
  )
  await Promise.all(
    hasManyKeys.map(async (key) => {
      const hasManyClass: ModelStatic<Model> = hasMany[key]()
      const table = getTableInstance(hasManyClass)
      const tableName = hasManyClass.prototype._tableName

      const relation = relations.find(({ name }) => name === tableName)
      if (!relation) return

      const prototype = hasManyClass.prototype
      const foreignKeys = Object.keys(prototype._foreignKey || {})
        .map((key) => {
          if (!prototype._foreignKey || !prototype._foreignKey[key]) return
          const foreignKey = prototype._foreignKey[key]() as ModelStatic<Model>
          const tableName = foreignKey.prototype._tableName
          return {
            key,
            tableName,
          }
        })
        .filter(Boolean)
      const foreignKey = foreignKeys.find((key) => key.tableName === selfTableName)
      if (!foreignKey) return

      const modelsData = await table.where(foreignKey.key).equals(self.id).toArray()
      const models = await Promise.all(
        modelsData.map(async (modelData) => {
          const model = asignModel(hasManyClass, modelData)
          if (relation.includes) await includesRelations(model, relation.includes)
          return model
        }),
      )
      Object.assign(self, { [key]: models })
      // if (relation)
      // const foreignKey = foreignKeys.find((key) => key.tableName === tableName)
      // console.log(foreignKey)
    }),
  )
  await Promise.all(
    hasOneKeys.map(async (key) => {
      const hasOneClass: ModelStatic<Model> = hasOne[key]()
      const table = getTableInstance(hasOneClass)
      const tableName = hasOneClass.prototype._tableName

      const relation = relations.find(({ name }) => name === tableName)
      if (!relation) return

      const prototype = hasOneClass.prototype
      const foreignKeys = Object.keys(prototype._foreignKey || {})
        .map((key) => {
          if (!prototype._foreignKey || !prototype._foreignKey[key]) return
          const foreignKey = prototype._foreignKey[key]() as ModelStatic<Model>
          const tableName = foreignKey.prototype._tableName
          return {
            key,
            tableName,
          }
        })
        .filter(Boolean)
      const foreignKey = foreignKeys.find((key) => key.tableName === selfTableName)
      if (!foreignKey) return

      const modelData = await table.where(foreignKey.key).equals(self.id).first()
      const model = modelData ? asignModel(hasOneClass, modelData) : null
      if (model && relation.includes) await includesRelations(model, relation.includes)
      Object.assign(self, { [key]: model })
    }),
  )
}

export abstract class Model {
  declare readonly id: number
  declare readonly updatedAt: Date
  declare readonly createdAt: Date

  public static async create<M extends Model>(
    this: ModelStatic<M>,
    data: CreateAttributes<M>,
    options?: { includes: IncludeAttributes },
  ): Promise<M> {
    const { includes } = options || {}
    const payload = { ...data, createdAt: new Date(), updatedAt: new Date() }
    await getTableInstance(this).add(payload)

    const model = asignModel(this, payload)
    if (includes) await includesRelations(model, includes)
    return model
  }
  public static async update<M extends Model>(
    this: ModelStatic<M>,
    data: UpdateAttributes<M>,
    options?: FindOptions<M>,
  ): Promise<void> {
    const { where, limit, offset, order } = options || {}
    const table = getTableInstance(this)

    const collection = getWhereCollecition(table, where)
    if (order) {
      const [key, direction] = Array.isArray(order) ? order : [order, "ASC"]
      if (typeof key === "string") {
        collection.sortBy(key)
        if (direction === "DESC") collection.reverse()
      }
    }
    if (offset) collection.offset(offset)
    if (limit) collection.limit(limit)

    const payload = { ...data, updatedAt: new Date() }
    await collection
      .toArray()
      .then((rows) => Promise.all(rows.map((row) => table.update(row.id, payload))))
  }
  public static async destroy<M extends Model>(
    this: ModelStatic<M>,
    options?: FindOptions<M>,
  ): Promise<number> {
    const { where, limit, offset, order } = options || {}
    const table = getTableInstance(this)

    const collection = getWhereCollecition(table, where)
    if (order) {
      const [key, direction] = Array.isArray(order) ? order : [order, "ASC"]
      if (typeof key === "string") {
        collection.sortBy(key)
        if (direction === "DESC") collection.reverse()
      }
    }
    if (offset) collection.offset(offset)
    if (limit) collection.limit(limit)

    const rows = await collection
      .toArray()
      .then((rows) => Promise.all(rows.map((row) => table.delete(row.id))))
    return rows.length
  }
  public static async findById<M extends Model>(
    this: ModelStatic<M>,
    id: number,
    options?: { includes: IncludeAttributes },
  ): Promise<M | null> {
    const { includes } = options || {}
    const table = getTableInstance(this)
    const data = await table.get(id)
    if (!data) return null

    const model = asignModel(this, data)
    if (includes) await includesRelations(model, includes)
    return model
  }
  public static async findOne<M extends Model>(
    this: ModelStatic<M>,
    options?: FindOptions<M>,
  ): Promise<M | null> {
    const { where, limit, offset, order, includes } = options || {}
    const table = getTableInstance(this)

    const collection = getWhereCollecition(table, where)
    if (order) {
      const [key, direction] = Array.isArray(order) ? order : [order, "ASC"]
      if (typeof key === "string") {
        collection.sortBy(key)
        if (direction === "DESC") collection.reverse()
      }
    }
    if (offset) collection.offset(offset)
    if (limit) collection.limit(limit)

    const data = await collection.first()
    if (!data) return null

    const model = asignModel(this, data)
    if (includes) await includesRelations(model, includes)
    return model
  }
  public static async findAll<M extends Model>(
    this: ModelStatic<M>,
    options?: FindOptions<M>,
  ): Promise<M[]> {
    const { where, limit, offset, order, includes } = options || {}
    const table = getTableInstance(this)

    const collection = getWhereCollecition(table, where)
    if (order) {
      const [key, direction] = Array.isArray(order) ? order : [order, "ASC"]
      if (typeof key === "string") {
        collection.sortBy(key)
        if (direction === "DESC") collection.reverse()
      }
    }
    if (offset) collection.offset(offset)
    if (limit) collection.limit(limit)

    const rows = await collection.toArray()

    return Promise.all(
      rows.map(async (row) => {
        const model = asignModel(this, row)
        if (includes) await includesRelations(model, includes)
        return model
      }),
    )
  }
  public static async count<M extends Model>(
    this: ModelStatic<M>,
    where?: WhereAttributes<M>,
  ) {
    const table = getTableInstance(this)
    const collection = getWhereCollecition(table, where)
    return collection.count()
  }

  public async update<M extends Model>(this: M, data: UpdateAttributes<M>): Promise<M> {
    const payload = { ...data, updatedAt: new Date() }
    const table = getTableInstance(this.constructor as ModelStatic<M>)
    await table.update(this.id, payload)

    Object.assign(this, payload)
    return this
  }
  public async save<M extends Model>(this: M): Promise<M> {
    const payload: Record<string, any> = {}
    Object.keys(this).map((key) => {
      if (["id", "createdAt", "updatedAt"].includes(key)) return
      payload[key] = this[key as keyof M]
    })
    payload.updatedAt = new Date()
    Object.assign(this, payload)

    const table = getTableInstance(this.constructor as ModelStatic<M>)
    await table.update(this.id, payload)

    return this
  }
  public async destroy<M extends Model>(this: M): Promise<void> {
    const table = getTableInstance(this.constructor as ModelStatic<M>)
    await table.delete(this.id)
  }
  public async refresh<M extends Model>(
    this: M,
    options?: { includes: IncludeAttributes },
  ): Promise<M> {
    const { includes } = options || {}
    const table = getTableInstance(this.constructor as ModelStatic<M>)
    const data = await table.get(this.id)
    if (!data) throw new Error("Record not found")

    Object.assign(this, data)
    if (includes) await includesRelations(this, includes)

    return this
  }
}
