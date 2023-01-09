import { useState } from 'react'

const getValueFromColumn = ({ id, name }) => id || name.toLowerCase()

const getLabelValueTableColumns = tableColumns =>
  tableColumns.reduce(
    (columns, { id: value, Header: label, visibility }) =>
      visibility === 'fixed' ? columns : [...columns, { value: getValueFromColumn({ id: value, name: label }), label }],
    []
  )

const getColumnsIds = tableColumns => tableColumns.map(({ id, Header: name }) => getValueFromColumn({ id, name }))

const getSelectedColumns = (tableColumns, selectedColumnsIds) =>
  tableColumns
    .map(column => ({ ...column, id: getValueFromColumn({ id: column.id, name: column.Header }) }))
    .filter(({ visibility, id }) => visibility === 'fixed' || selectedColumnsIds.includes(id))

// TODO: Make visibility: "default" work. Show fixed and default columns on page load
export const useColumnSelection = tableColumns => {
  const [selectedColumnsIds, setSelectedColumnsIds] = useState(getColumnsIds(tableColumns))
  const labelValueColumns = getLabelValueTableColumns(tableColumns)
  const selectedColumns = getSelectedColumns(tableColumns, selectedColumnsIds)
  const visibleColumnsIds = getColumnsIds(selectedColumns)
  const setSelectedColumns = columnsIds => {
    if (columnsIds) {
      setSelectedColumnsIds(columnsIds)
    }
  }
  return { selectedColumns, visibleColumnsIds, labelValueColumns, setSelectedColumns }
}
