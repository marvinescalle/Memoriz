export const setTableName = (target: any, tableName: string): void => {
  target._tableName = tableName
}
export const addColumn = (target: any, columnName: string): void => {
  if (!target._columns) target._columns = []
  target._columns.push(columnName)
}
