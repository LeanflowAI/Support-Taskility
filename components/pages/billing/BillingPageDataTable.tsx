/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { DataTable } from '../../ui-elements/data-table'

interface BillingPageDataTableProps {
  rowSize: 'S' | 'M' | 'L'
  invoices: any[]
}

export const BillingPageDataTable = (props: BillingPageDataTableProps) => {
  // Don't render DataTable if there's no data available.
  // That allows the CSV file to generate correctly. TODO: Review this approach.
  const { invoices } = props
  return invoices ? (
    // Set pageSize makes the table dynamically resize to fit the available data.
    // @ts-ignore
    // eslint-disable-next-line react/jsx-props-no-spreading
    <DataTable data={invoices} pageSize={invoices.length} defaultSorted={[{ id: 'date', desc: false }]} {...props} />
  ) : null
}
