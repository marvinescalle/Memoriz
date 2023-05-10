import { setTableName } from "./model-service"

export interface TableProps {
  name?: string
}
export const Table = (props?: TableProps) => {
  const { name } = props || {}

  return (target: any) => {
    setTableName(target.prototype, name || target.name)
  }
}
