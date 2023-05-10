import { addColumn } from "./model-service"

export const Column = () => {
  return (target: any, propertyKey: string) => {
    addColumn(target, propertyKey)
  }
}
