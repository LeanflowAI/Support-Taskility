// import { i18n } from '../../../services/i18n'

export const billingPageFilters = [
  {
    label: 'Tipo de CFDI',
    value: 'cfdiType',
    filterOptions: [
      // { label: i18n('cfdiType.invoice'), value: 'ingreso' },
      // { label: i18n('cfdiType.creditNote'), value: 'egreso' },
      // TODO: i18n not ready at this point
      { label: 'Factura', value: 'ingreso' },
      { label: 'Nota crédito', value: 'egreso' },
    ],
  },
  {
    label: 'Estado',
    value: 'status',
    filterOptions: [
      // { label: i18n('cfdiStatus.active'), value: 'active' },
      // { label: i18n('cfdiStatus.cancelled'), value: 'cancelled' },
      // { label: i18n('cfdiStatus.creditNote'), value: 'creditNote' },
      // { label: i18n('cfdiStatus.cancelPending'), value: 'cancelPending' },
      // { label: i18n('cfdiStatus.payed'), value: 'payed' },
      // TODO: i18n not ready at this point
      { label: 'Activa', value: 'active' },
      { label: 'Cancelada', value: 'canceled' },
      { label: 'Cancelación pendiente', value: 'cancelPending' },
      { label: 'Pagada', value: 'payed' },
      // { label: 'Con nota crédito', value: 'creditNote' },
    ],
  },
  {
    label: 'Emisor',
    value: 'issuer',
    // TODO: Retrieve filterOptions (issuer names) from database and cache on redux
    // filterOptions: [{ label: 'Emisor 1', value: '1' }, { label: 'Emisor 2', value: '2' }],
  },
  {
    label: 'Cliente',
    value: 'client',
    // TODO: Retrieve filterOptions (client names) from database and cache on redux
    // filterOptions: [{ label: 'Cliente 1', value: '1' }, { label: 'Cliente 2', value: '2' }],
  },
  {
    label: 'Moneda',
    value: 'currency',
    filterOptions: [
      { label: 'USD', value: 'USD' },
      { label: 'MXN', value: 'MXN' },
    ],
  },
  { label: 'RFC de cliente', value: 'clientRfc' },
  { label: 'Referencia', value: 'reference' },
  { label: 'Fecha', value: 'dateRange', inputType: 'date-range' },
  { label: 'Tasa de cambio', value: 'exchangeRate', inputType: 'number-range' },
  { label: 'Subtotal', value: 'subtotal', inputType: 'number-range' },
  { label: 'Total', value: 'total', inputType: 'number-range' },
]
