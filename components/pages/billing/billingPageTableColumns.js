/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
import React from 'react'
import subDays from 'date-fns/subDays'
import isAfter from 'date-fns/isAfter'
import parseISO from 'date-fns/parseISO'
import { i18n } from '../../../services/i18n'
import { defaultTheme } from '../../ui-elements/themes'

// TODO: i18n for Header fields
export const billingPageTableColumns = [
  { id: 'rowNumber', Header: 'Nº', Cell: ({ index }) => index + 1, width: 40, visibility: 'fixed' },
  { Header: 'Tipo CFDI', accessor: d => i18n(`cfdiType.${d.cfdiType}`), width: 80, visibility: 'fixed' },
  {
    Header: 'Referencia',
    accessor: 'invoiceOrderReference',
    Cell: ({ value, original }) =>
      original.invoiceOrderId ? (
        <a href={`https://app.leanflow.ai/orden/${original.invoiceOrderId}`} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : null,
    filterable: true,
    width: 80,
    visibility: 'fixed',
  },
  {
    Header: 'Folio',
    accessor: 'folio',
    Cell: ({ value, original }) => (
      <a href={`/invoice/${original.id}`} target="_blank" rel="noopener noreferrer">
        {value}
      </a>
    ),
    filterable: true,
    width: 50,
    visibility: 'fixed',
  },
  { Header: 'Emisor', accessor: 'issuer', filterable: true, visibility: 'fixed' },
  { Header: 'Cliente', accessor: 'receiver', filterable: true, visibility: 'fixed' },
  { Header: 'RFC de cliente', accessor: 'receiverFiscalId', filterable: true },
  {
    id: 'date',
    Header: 'Fecha',
    accessor: d => d.date.slice(0, 10),
    filterable: true,
    width: 80,
    visibility: 'fixed',
  },
  { id: 'hour', Header: 'Hora', accessor: d => d.date.slice(11, 16), filterable: true, width: 50 },
  { Header: 'UUID', accessor: 'uuid', filterable: true, width: 50 },
  {
    id: 'currency',
    Header: 'Moneda',
    accessor: 'currency',
    filterable: true,
    width: 150,
    visibility: 'default',
  },
  {
    id: 'exchangeRate',
    Header: 'Tasa de cambio',
    accessor: 'exchangeRate',
    filterable: true,
    width: 80,
    visibility: 'default',
  },
  { id: 'discount', Header: 'Descuento', accessor: d => `$${d.discount}`, width: 80 },
  {
    id: 'subtotal',
    Header: 'Subtotal',
    accessor: d => `$${d.subtotal}`,
    Cell: ({ value }) => <div style={{ width: '100%', textAlign: 'right' }}>{value}</div>,
    filterable: true,
    width: 80,
  },
  {
    id: 'total',
    Header: 'Total',
    accessor: d => `$${d.total}`,
    Cell: ({ value }) => <div style={{ width: '100%', textAlign: 'right' }}>{value}</div>,
    filterable: true,
    width: 80,
  },
  {
    Header: 'Condiciones de pago',
    accessor: 'paymentConditions',
    filterable: true,
    width: 80,
  },
  {
    Header: 'Método de pago',
    accessor: 'paymentMethod',
    filterable: true,
    width: 80,
  },
  {
    Header: 'Saldo',
    accessor: d => (d.pendingAmount ? `$${d.pendingAmount}` : null),
    filterable: true,
    width: 80,
  },
  {
    Header: 'IVA Transferido',
    accessor: d => (d.transferredIva ? `$${d.transferredIva}` : null),
    filterable: true,
    width: 80,
  },
  {
    Header: 'IVA Retenido',
    accessor: d => (d.withheldIva ? `$${d.withheldIva}` : null),
    filterable: true,
    width: 80,
  },
  {
    id: 'status',
    Header: 'Estado',
    accessor: d => d.status.map(status => i18n(status)).join(' '),
    filterable: true,
    width: 50,
  },
  {
    Header: 'Vencimiento',
    accessor: d => (d.expirationDate ? d.expirationDate.slice(0, 10) : null),
    Cell: ({ value: expirationDate, original: invoice }) => {
      const style = {}
      // Only apply color to invoice without payment
      if (!invoice.status.includes('payed')) {
        if (isAfter(new Date(), parseISO(expirationDate))) {
          style.color = defaultTheme.colors.error
        } else if (isAfter(new Date(), subDays(parseISO(expirationDate), 7))) {
          style.color = defaultTheme.colors.warning
        } else {
          style.color = defaultTheme.colors.success
        }
      }
      return <div style={style}>{expirationDate}</div>
    },
    filterable: true,
    width: 80,
  },
  {
    Header: 'Solicitud de cancelación',
    accessor: d => (d.cancelledRequestDate ? d.cancelledRequestDate.slice(0, 10) : null),
    filterable: true,
    width: 80,
  },
  {
    Header: 'Fecha cancelación',
    accessor: d => (d.cancelledDate ? d.cancelledDate.slice(0, 10) : null),
    filterable: true,
    width: 80,
  },
  {
    Header: 'Cancelado por',
    accessor: 'cancelledByUsername',
    filterable: true,
    width: 120,
  },
  {
    Header: 'Creación de complemento de pago',
    accessor: 'paymentProofsCreationDates',
    filterable: true,
    width: 90,
  },

  // {
  //   id: 'actions',
  //   Header: '',
  //   // accessor: d => `${i18n(d.status)}`,
  //   Cell: () => <div></div>,
  //   filterable: true,
  //   width: 80,
  //   visibility: 'fixed',
  // },
]
