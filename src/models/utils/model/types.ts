import { Collection, IndexableType, Table } from "dexie"

import { Model } from "./model"

type NonConstructorKeys<T> = {
  [P in keyof T]: T[P] extends new () => any ? never : P
}[keyof T]
type NonConstructor<T> = Pick<T, NonConstructorKeys<T>>
export type ModelStatic<M extends Model> = NonConstructor<typeof Model> & { new (): M }

export type Attributes<M extends Model> = {
  [P in keyof M]: M[P]
}
export type CreateAttributes<M extends Model> = Pick<
  Attributes<M>,
  Exclude<
    keyof M,
    | "id"
    | "createdAt"
    | "updatedAt"
    | { [K in keyof M]: M[K] extends Function ? K : never }[keyof M]
    | {
        [K in keyof M]: M[K] extends Model ? K : M[K] extends Model[] ? K : never
      }[keyof M]
  >
>
export type UpdateAttributes<M extends Model> = Partial<CreateAttributes<M>>
export type IncludeAttributes = (
  | { new (): Model }
  | {
      model: { new (): Model }
      includes?: IncludeAttributes
    }
)[]

type WhereAttribute<T> = T extends Model | Model[]
  ? null
  : T extends string
  ? string | { $include?: string; $startsWith?: string; $endsWith?: string }
  : T extends number
  ? number | { $gt?: number; $gte?: number; $lt?: number; $lte?: number }
  : T extends Date
  ? Date | { $gt?: Date; $gte?: Date; $lt?: Date; $lte?: Date }
  : null
type ExcludeNullKeys<T> = Exclude<
  keyof T,
  Exclude<
    {
      [K in keyof T]: T[K] extends null | undefined ? K : never
    }[keyof T],
    undefined
  >
>

type WhereAttributesBeforeFiltering<M extends Model> = {
  [P in keyof M]?: WhereAttribute<M[P]>
}
export type WhereAttributes<M extends Model> =
  | Pick<
      WhereAttributesBeforeFiltering<M>,
      ExcludeNullKeys<WhereAttributesBeforeFiltering<M>>
    >
  | {
      $or?: WhereAttributes<M>[]
    }
type SortKeys<M extends Model> = keyof Pick<
  WhereAttributesBeforeFiltering<M>,
  ExcludeNullKeys<WhereAttributesBeforeFiltering<M>>
>
export type FindOptions<M extends Model> = {
  where?: WhereAttributes<M>
  limit?: number
  offset?: number
  order?: SortKeys<M> | [SortKeys<M>, "ASC" | "DESC"]
  includes?: IncludeAttributes
}

export type TableType = Table<any, IndexableType>
export type CollectionType = Collection<any, IndexableType>
