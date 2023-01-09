import actions from '../actions/action-types'

interface UserAction {
  type: string
  loginError?: string
  userDetails?: { username: string }
  signupError?: string
  signupMessage?: string
  verifyEmailError?: string
  verifyEmailMessage?: string
  accountRecoveryError?: string
  accountRecoveryMessage?: string
  accountRecoveryTokenError?: string
  passwordChangeError?: string
  passwordChangeMessage?: string
}

export const userReducer = (state: any = {}, action: UserAction) => {
  switch (action.type) {
    case actions.USER_LOGIN_START:
      return { ...state, isLoggingIn: true, loginError: null }
    case actions.USER_LOGIN_ERROR:
      const { loginError } = action
      return { ...state, isLoggingIn: false, loginError }
    case actions.USER_LOGIN_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        loginError: null,
        username: action.userDetails && action.userDetails.username,
      }
    case actions.USER_SIGN_UP_START:
      return { ...state, isSigningUp: true, signupError: null }
    case actions.USER_SIGN_UP_ERROR:
      const { signupError } = action
      return { ...state, isSigningUp: false, signupError }
    case actions.USER_SIGN_UP_SUCCESS:
      return {
        ...state,
        isSigningUp: false,
        signupError: null,
        signupMessage: action.signupMessage,
      }
    case actions.VERIFY_EMAIL_START:
      return { ...state, isVerifyingEmail: true, verifyEmailError: null }
    case actions.VERIFY_EMAIL_ERROR:
      const { verifyEmailError } = action
      return { ...state, isVerifyingEmail: false, verifyEmailError }
    case actions.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        isVerifyingEmail: false,
        verifyEmailError: null,
        verifyEmailMessage: action.verifyEmailMessage,
      }
    case actions.SEND_ACCOUNT_RECOVERY_EMAIL_START:
      return { ...state, isSendingAccountRecoveryEmail: true, accountRecoveryError: null }
    case actions.SEND_ACCOUNT_RECOVERY_EMAIL_ERROR:
      const { accountRecoveryError } = action
      return { ...state, isSendingAccountRecoveryEmail: false, accountRecoveryError }
    case actions.SEND_ACCOUNT_RECOVERY_EMAIL_SUCCESS:
      return {
        ...state,
        isSendingAccountRecoveryEmail: false,
        accountRecoveryError: null,
        accountRecoveryMessage: action.accountRecoveryMessage,
      }
    case actions.VERIFY_ACCOUNT_RECOVERY_TOKEN_START:
      return { ...state, isVerifyingToken: true, accountRecoveryTokenError: null }
    case actions.VERIFY_ACCOUNT_RECOVERY_TOKEN_ERROR:
      return { ...state, isVerifyingToken: false, accountRecoveryTokenError: action.accountRecoveryTokenError }
    case actions.VERIFY_ACCOUNT_RECOVERY_TOKEN_SUCCESS:
      return {
        ...state,
        isVerifyingToken: false,
        accountRecoveryTokenError: null,
      }
    case actions.PASSWORD_CHANGE_START:
      return { ...state, isChangingPassword: true, passwordChange: null }
    case actions.PASSWORD_CHANGE_SUCCESS:
      return {
        ...state,
        isChangingPassword: false,
        passwordChangeError: null,
        passwordChangeMessage: action.passwordChangeMessage,
      }
    case actions.PASSWORD_CHANGE_ERROR:
      return { ...state, isChangingPassword: false, passwordChangeError: action.passwordChangeError }
    case actions.USER_LOGOUT:
      return { ...state, username: '' }
    default:
      return state
  }
}
