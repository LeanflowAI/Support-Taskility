import { Dispatch } from 'redux'
import { invoicesListActions } from './action-types'
import { Cfdi } from '../../services/model'
import { log } from '../../services/logs'
import { post } from '../../services/fetch'

const loadInvoiceSuccess = (invoice: Cfdi) => ({
  type: invoicesListActions.LOAD_INVOICE_SUCCESS,
  invoice,
})

export const loadInvoice = (invoiceId: string) => (dispatch: Dispatch) => {
  post('/api/billing/load-invoice', { body: { invoiceId } })
    .then(({ error, invoice }) => {
      if (error) {
        // TODO: Implementation pending
        // dispatch(loadInvoiceError...
        log('error', error)
      } else {
        dispatch(loadInvoiceSuccess(invoice))
      }
    })
    .catch(error => {
      log('error', error.message)
      // TODO: dispatch(loadInvoiceError...
    })
}
