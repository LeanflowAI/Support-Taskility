import { invoicesListActions } from '../actions/action-types'
import { Cfdi } from '../../services/model'

interface InvoicesListAction {
  type: string
  invoices?: Array<Cfdi>
  invoice?: Cfdi
  count: number
}

export interface InvoicesListState {
  // TODO: Describe shape
  invoices: Array<Cfdi>
  count: number
}

const initialState: InvoicesListState = {
  invoices: [],
  count: 0,
}

export const invoicesListReducer = (state: any = initialState, action: InvoicesListAction) => {
  switch (action.type) {
    // TODO: invoicesListActions.LOAD_INVOICES_START, invoicesListActions.LOAD_INVOICES_ERROR
    case invoicesListActions.LOAD_INVOICES_SUCCESS:
      return { ...state, invoices: action.invoices, count: action.count }
    case invoicesListActions.LOAD_MORE_INVOICES_SUCCESS:
      // @ts-ignore
      return { ...state, invoices: [...state.invoices, ...action.invoices] }
    case invoicesListActions.LOAD_INVOICE_SUCCESS:
      return { ...state, invoices: [...state.invoices, action.invoice] }
    // TODO: invoicesListActions.LOAD_INVOICE_START, invoicesListActions.LOAD_INVOICE_ERROR
    default:
      return state
  }
}

const invoiceContainsText = (searchTexts: Array<string>) => (invoice: Cfdi) => {
  const fields = ['invoiceOrderReference', 'folio', 'issuer', 'receiver', 'receiverFiscalId', 'uuid', 'date', 'subtotal', 'total']
  return searchTexts.every(searchText =>
    fields
      // @ts-ignore
      .filter(field => invoice[field])
      .some(field => {
        // @ts-ignore
        const fieldText = invoice[field].toString().toLowerCase()
        return fieldText.includes(searchText.toLowerCase())
      })
  )
}

export const selectInvoices = (fullSearchText: string, state: InvoicesListState) => {
  if (!fullSearchText) {
    return state.invoices
  }
  // Allow the definition of search sections with spaces surrounded by quotes i.e: "A NAME" 123 "ANOTHER NAME"
  // @ts-ignore
  const searchTexts = fullSearchText.match(/(?:[^\s"]+|"[^"]*")+/g).map(text => text.replace(/"/g, ''))
  return state.invoices ? state.invoices.filter(invoiceContainsText(searchTexts)) : state.invoices
}

export const selectInvoicesFullCount = (state: InvoicesListState) => state.count

export const selectInvoicesCount = (state: InvoicesListState) => (state.invoices ? state.invoices.length : 0)

export const selectInvoice = (invoiceId: string, state: InvoicesListState) => {
  if (!invoiceId) {
    return null
  }
  return state.invoices ? state.invoices.find(invoice => invoice._id) : null
}
