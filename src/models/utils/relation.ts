import { Model } from "./model/model"

export const ForeignKey = <M extends Model>(callback: () => { new (): M }) => {
  return (target: any, propertyKey: string) => {
    if (!target._foreignKey) target._foreignKey = {}
    target._foreignKey[propertyKey] = callback
  }
}
export const BelongsTo = <M extends Model>(callback: () => { new (): M }) => {
  return (target: any, propertyKey: string) => {
    if (!target._belongsTo) target._belongsTo = {}
    target._belongsTo[propertyKey] = callback
  }
}
export const HasMany = <M extends Model>(callback: () => { new (): M }) => {
  return (target: any, propertyKey: string) => {
    if (!target._hasMany) target._hasMany = {}
    target._hasMany[propertyKey] = callback
  }
}
export const HasOne = <M extends Model>(callback: () => { new (): M }) => {
  return (target: any, propertyKey: string) => {
    if (!target._hasOne) target._hasOne = {}
    target._hasOne[propertyKey] = callback
  }
}
