import actions, { userSettingsActions } from '../actions/action-types'

export interface UserSettingsState {
  // TODO: Describe exact shape
  [key: string]: any
}

interface UserSettingsAction {
  type: string
  section: string
  setting?: string
  value: any
  userDetails: { username: string; savedUserSettings: object }
  settings: {}
}

const initialState: UserSettingsState = {
  billingPage: {
    rowSize: 'M',
    selectedColumns: null,
  },
}

export const userSettingsReducer = (state: any = initialState, action: UserSettingsAction) => {
  switch (action.type) {
    case actions.USER_LOGIN_SUCCESS:
      const { savedUserSettings } = action.userDetails
      return savedUserSettings ? { ...state, ...savedUserSettings } : state
    case userSettingsActions.LOAD_USER_SETTINGS_SUCCESS:
      return action.settings ? { ...state, ...action.settings } : state
    case actions.USER_LOGOUT:
      return initialState
    case userSettingsActions.SET_USER_SETTING:
      const newSection = action.setting
        ? { ...state[action.section], [action.setting]: action.value }
        : state[action.section]
      return action.section ? { ...state, [action.section]: newSection || initialState[action.section] } : state
    case userSettingsActions.SET_USER_SETTINGS:
      return action.setting ? { ...state, [action.setting]: action.value || initialState[action.setting] } : state
    default:
      return state
  }
}

export const selectUserSettings = (section: string, state: UserSettingsState) => state[section]
