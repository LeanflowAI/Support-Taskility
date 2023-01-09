import cookie from 'js-cookie'
import Router from 'next/router'
import { Dispatch } from 'redux'
import actions, { invoicesListActions } from './action-types'
import { log } from '../../services/logs'
import { post } from '../../services/fetch'

export { loadUserSettings, setUserSetting, setUserSettings, saveUserSettings } from './user-actions'

const userLoginStart = () => ({ type: actions.USER_LOGIN_START })

const userLoginSuccess = (userDetails: { username: string; savedUserSettings: object }) => ({
  type: actions.USER_LOGIN_SUCCESS,
  userDetails,
})

const userLoginError = (loginError: string) => ({ type: actions.USER_LOGIN_ERROR, loginError })

export const login = ({ email, password }: { email: string; password: string }) => (dispatch: Dispatch, getState: Function) => {
  console.log('login function reached', {email, password})
  const { isLoggingIn, username } = getState()
  if (isLoggingIn || username) {
    return
  }

  dispatch(userLoginStart())
  console.log('user login started')
  post('/api/users/login', { body: { email, password } })
    .then(({ error, userDetails, token }) => {
      if (error) {
        dispatch(userLoginError(error))
      } else {
        dispatch(userLoginSuccess(userDetails))
        // Cookie expiration must match the token expiration.
        cookie.set('token', token, { expires: 1 / 2 })
        localStorage.setItem('token', token)
        Router.push('/bill-of-lading') // TODO: Redirect to a user selected initial page.
      }
    })
    .catch(error => {
      log('error', error.message)
      dispatch(userLoginError('login.errors.unexpected'))
    })
}

export const logout = () => (dispatch: Dispatch) => {
  cookie.remove('token')
  // to support logging out from all windows
  localStorage.setItem('logout', Date.now().toString())
  Router.push('/login')
  dispatch({ type: actions.USER_LOGOUT })
}

const userSignupStart = () => ({ type: actions.USER_SIGN_UP_START })

const userSignupSuccess = (successMessage: string) => ({
  type: actions.USER_SIGN_UP_SUCCESS,
  signupMessage: successMessage,
})

const userSignupError = (signupError: string) => ({ type: actions.USER_SIGN_UP_ERROR, signupError })

interface UserSignupData {
  username: string
  email: string
  password: string
}

export const signup = ({ username, email, password }: UserSignupData) => (dispatch: Dispatch, getState: Function) => {
  const { isSigningUp, username: loggedUsername } = getState()
  if (isSigningUp || loggedUsername) {
    return
  }

  dispatch(userSignupStart())

  post('/api/users/signup', { body: { username, email, password } })
    .then(({ error, message }) => {
      if (error) {
        dispatch(userSignupError(error))
      } else {
        dispatch(userSignupSuccess(message))
        Router.push('/login')
      }
    })
    .catch(error => {
      log('error', error.message)
      dispatch(userSignupError('signup.errors.unexpected'))
    })
}

const verifyEmailStart = () => ({ type: actions.VERIFY_EMAIL_START })

const verifyEmailSuccess = (successMessage: string) => ({
  type: actions.VERIFY_EMAIL_SUCCESS,
  verifyEmailMessage: successMessage,
})

const verifyEmailError = (verifyEmailErrorText: string) => ({
  type: actions.VERIFY_EMAIL_ERROR,
  verifyEmailError: verifyEmailErrorText,
})

export const verifyEmailAccount = ({ token }: { token: string }) => (dispatch: Dispatch) => {
  dispatch(verifyEmailStart())
  post('/api/users/verify-email', { body: { token } })
    .then(({ error, message }) => {
      if (error) {
        dispatch(verifyEmailError(error))
      } else {
        dispatch(verifyEmailSuccess(message))
      }
    })
    .catch(error => {
      log('error', error.message)
      dispatch(verifyEmailError('verifyEmail.errors.unexpected'))
    })
}

const sendAccountRecoveryEmailStart = () => ({ type: actions.SEND_ACCOUNT_RECOVERY_EMAIL_START })

const sendAccountRecoveryEmailSuccess = (successMessage: string) => ({
  type: actions.SEND_ACCOUNT_RECOVERY_EMAIL_SUCCESS,
  accountRecoveryMessage: successMessage,
})

const sendAccountRecoveryEmailError = (errorMessage: string) => ({
  type: actions.SEND_ACCOUNT_RECOVERY_EMAIL_ERROR,
  accountRecoveryError: errorMessage,
})

export const sendAccountRecoveryEmail = ({ email }: { email: string }) => (dispatch: Dispatch) => {
  dispatch(sendAccountRecoveryEmailStart())
  post('/api/users/send-account-recovery-email', { body: { email } })
    .then(({ error, message }) => {
      if (error) {
        dispatch(sendAccountRecoveryEmailError(error))
      } else {
        dispatch(sendAccountRecoveryEmailSuccess(message))
      }
    })
    .catch(error => {
      log('error', error.message)
      dispatch(sendAccountRecoveryEmailError('accountRecovery.errors.unexpected'))
    })
}

const verifyAccountRecoveryTokenStart = () => ({ type: actions.VERIFY_ACCOUNT_RECOVERY_TOKEN_START })

const verifyAccountRecoveryTokenSuccess = () => ({
  type: actions.VERIFY_ACCOUNT_RECOVERY_TOKEN_SUCCESS,
})

const verifyAccountRecoveryTokenError = (errorMessage: string) => ({
  type: actions.VERIFY_ACCOUNT_RECOVERY_TOKEN_ERROR,
  accountRecoveryTokenError: errorMessage,
})

export const verifyAccountRecoveryToken = (token: string) => (dispatch: Dispatch) => {
  dispatch(verifyAccountRecoveryTokenStart())
  post('/api/users/verify-account-recovery-token', { body: { token } })
    .then(({ error }) => {
      if (error) {
        dispatch(verifyAccountRecoveryTokenError(error))
      } else {
        dispatch(verifyAccountRecoveryTokenSuccess())
      }
    })
    .catch(error => {
      log('error', error.message)
      dispatch(verifyAccountRecoveryTokenError('passwordChange.errors.unexpected'))
    })
}

const changeUserPasswordStart = () => ({ type: actions.PASSWORD_CHANGE_START })

const changeUserPasswordSuccess = (message: string) => ({
  type: actions.PASSWORD_CHANGE_SUCCESS,
  passwordChangeMessage: message,
})

const changeUserPasswordError = (error: string) => ({
  type: actions.PASSWORD_CHANGE_ERROR,
  passwordChangeError: error,
})

interface ChangeUserPasswordParams {
  token: string
  newPassword: string
  repeatedPassword: string
}

export const changeUserPassword = (params: ChangeUserPasswordParams) => (dispatch: Dispatch) => {
  dispatch(changeUserPasswordStart())
  const { token, newPassword, repeatedPassword } = params
  post('/api/users/update-password', { body: { token, newPassword, repeatedPassword } })
    .then(({ error, message }) => {
      if (error) {
        dispatch(changeUserPasswordError(error))
      } else {
        dispatch(changeUserPasswordSuccess(message))
        Router.push('/login')
      }
    })
    .catch(error => {
      log('error', error.message)
      dispatch(changeUserPasswordError('passwordChange.errors.unexpected'))
    })
}

const loadInvoicesStart = () => ({ type: invoicesListActions.LOAD_INVOICES_START })

// TODO: Update "Object" to use an Invoice interface
const loadInvoicesSuccess = (invoices: Array<Object>, count: number) => ({
  type: invoicesListActions.LOAD_INVOICES_SUCCESS,
  invoices,
  count,
})

const loadInvoicesError = (error: string) => ({ type: invoicesListActions.LOAD_INVOICES_ERROR, error })

interface LoadInvoicesParams {
  filters: any[]
  searchText: string
}

export const loadInvoices = ({ filters, searchText }: LoadInvoicesParams) => {
  return (dispatch: Dispatch, getState: Function) => {
    const { isLoading } = getState()
    if (isLoading) return
    dispatch(loadInvoicesStart())
    post('/api/invoices/list', { body: { filters, searchText } })
      .then(({ error, invoices, count }) => {
        if (error) {
          dispatch(loadInvoicesError(error))
        } else {
          dispatch(loadInvoicesSuccess(invoices, count))
        }
      })
      .catch(error => {
        log('error', error.message)
        dispatch(loadInvoicesError('login.errors.unexpected'))
      })
  }
}

const loadMoreInvoicesSuccess = (invoices: Array<Object>) => ({
  type: invoicesListActions.LOAD_MORE_INVOICES_SUCCESS,
  invoices,
})

interface LoadMoreInvoicesParams {
  filters: any[]
  searchText: string
  skip?: number
}

export const loadMoreInvoices = ({ filters, searchText, skip }: LoadMoreInvoicesParams) => {
  return (dispatch: Dispatch, getState: Function) => {
    const { isLoading, invoicesList } = getState()
    if (isLoading) return
    if (invoicesList.count === invoicesList.invoices.length) return

    dispatch(loadInvoicesStart())
    post('/api/invoices/list', { body: { filters, searchText, skip } })
      .then(({ error, invoices }) => {
        if (error) {
          dispatch(loadInvoicesError(error))
        } else {
          dispatch(loadMoreInvoicesSuccess(invoices))
        }
      })
      .catch(error => {
        log('error', error.message)
        dispatch(loadInvoicesError('login.errors.unexpected'))
      })
  }
}

const sendDialogFlowTextUtteranceStart = (userMessage: string) => ({
  type: actions.SEND_DIALOG_FLOW_TEXT_UTTERANCE_START,
  userMessage,
})
const sendDialogFlowTextUtteranceSuccess = (agentMessage: string) => ({
  type: actions.SEND_DIALOG_FLOW_TEXT_UTTERANCE_SUCCESS,
  agentMessage,
})
const sendDialogFlowTextUtteranceError = (agentMessageError: string) => ({
  type: actions.SEND_DIALOG_FLOW_TEXT_UTTERANCE_ERROR,
  agentMessageError,
})

export const sendDialogFlowTextUtterance = (text: string) => {
  return (dispatch: Dispatch) => {
    post('/app/aiagent/ask', { body: { text } })
      .then(({ error, response }) => {
        if (error) {
          dispatch(sendDialogFlowTextUtteranceError(error))
        } else {
          dispatch(sendDialogFlowTextUtteranceSuccess(response))
        }
      })
      .catch(error => {
        log('error', error.message)
        dispatch(sendDialogFlowTextUtteranceError(error.message))
      })
  }
}

// TODO: Migrate components from "connect" to redux hooks and remove this default export.
export default {
  login,
  logout,
  signup,
  verifyEmailAccount,
  sendAccountRecoveryEmail,
  verifyAccountRecoveryToken,
  changeUserPassword,
  sendDialogFlowTextUtterance,
}
