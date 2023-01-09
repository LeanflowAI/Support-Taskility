import { combineReducers } from 'redux'
import { aiAgentReducer } from './aiAgentReducer'
import { userReducer } from './userReducer' // TODO: Join userReducer and user-reducer
import * as fromUserSettings from './user-reducer'
import * as fromInvoicesList from './invoices-list-reducer'

export default combineReducers({
  user: userReducer,
  aiAgent: aiAgentReducer,
  invoicesList: fromInvoicesList.invoicesListReducer,
  userSettings: fromUserSettings.userSettingsReducer,
})

// TODO: Complete state shape
export interface AppState {
  user: any
  aiAgent: any
  invoicesList: fromInvoicesList.InvoicesListState
  userSettings: fromUserSettings.UserSettingsState
}

export const selectUserSettings = (section: string) => (state: AppState) =>
  fromUserSettings.selectUserSettings(section, state.userSettings)

export const selectInvoices = (serchText: string) => (state: AppState) =>
  fromInvoicesList.selectInvoices(serchText, state.invoicesList)

export const selectInvoicesFullCount = (serchText: string) => (state: AppState) =>
  fromInvoicesList.selectInvoicesFullCount(state.invoicesList)

export const selectInvoicesCount = (state: AppState) => fromInvoicesList.selectInvoicesCount(state.invoicesList)

export const selectInvoice = (invoiceId: string) => (state: AppState) =>
  fromInvoicesList.selectInvoice(invoiceId, state.invoicesList)
