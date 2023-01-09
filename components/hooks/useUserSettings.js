import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadUserSettings, setUserSetting, saveUserSettings } from '../../state/actions/index.ts'
import { selectUserSettings } from '../../state/reducers/index.ts'

export const useUserSettings = settingsNamespace => {
  const dispatch = useDispatch()
  const settings = useSelector(selectUserSettings(settingsNamespace))
  useEffect(() => dispatch(loadUserSettings()), [])

  const saveSettings = () => dispatch(saveUserSettings())

  const setSetting = (name, value, save = true) => {
    dispatch(setUserSetting(settingsNamespace, name, value))
    if (save) dispatch(saveUserSettings())
  }

  return { setSetting, saveSettings, settings }
}
