export const sortedDataRowToCsv = columns => dataRow => {
  return columns.map(column => dataRow[column])
}

export const sortedDataToCsv = (dataRowToCsv, columns, sortedData = []) => {
  // const titles = ...
  // TODO: Skip column headers by now... find a way to match resolved table data with column headers. Using just ids.
  const csvContent = sortedData.map(dataRowToCsv(columns))
  return [columns, ...csvContent]
}
