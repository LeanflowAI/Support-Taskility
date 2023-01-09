import React from 'react'
import { CSVLink as BaseCSVLink } from 'react-csv'

// Workaround for https://github.com/react-csv/react-csv/issues/115
class CsvLink extends BaseCSVLink {
  componentWillReceiveProps(nextProps) {
    const { data, headers, separator, uFEFF } = nextProps
    this.setState({ href: this.buildURI(data, uFEFF, headers, separator) })
  }
}

export const DownloadCsvLink = ({ csvData, filename, children }) =>
  csvData.length === 0 ? null : (
    <CsvLink data={csvData} filename={filename}>
      {children}
    </CsvLink>
  )
