import { Dispatch } from 'redux'
import { userSettingsActions } from './action-types'
import { AppState } from '../reducers'
import { log } from '../../services/logs'
import { get, post } from '../../services/fetch'

const loadUserSettingsSuccess = (settings?: object) => ({
  type: userSettingsActions.LOAD_USER_SETTINGS_SUCCESS,
  settings,
})

export const loadUserSettings = () => (dispatch: Dispatch) => {
  get('/api/users/load-settings')
    .then(({ error, settings }) => {
      if (error) {
        // TODO: dispatch(loadUserSettingsError...
      } else {
        dispatch(loadUserSettingsSuccess(settings))
      }
    })
    .catch(error => {
      log('error', error.message)
      // TODO: dispatch(loadUserSettingsError...
    })
}

export const setUserSetting = (section: String, setting: string, value?: any) => ({
  type: userSettingsActions.SET_USER_SETTING,
  section,
  setting,
  value,
})

export const setUserSettings = (section: String, value?: any) => ({
  type: userSettingsActions.SET_USER_SETTINGS,
  section,
  value,
})

export const saveUserSettings = () => (dispatch: Dispatch, getState: () => AppState) => {
  post('/api/users/save-settings', { body: { settings: getState().userSettings } })
    .then(({ error }) => {
      if (error) {
        // TODO: dispatch(saveUserSettingsError...
      } else {
        // TODO: dispatch(saveUserSettingsSuccess(data.message))
      }
    })
    .catch(error => {
      log('error', error.message)
      // TODO: dispatch(saveUserSettingsError...
    })
}

export const saveBillingPageUserSettings = () => {
  // TODO: Implement... Save current settings to the database
}
