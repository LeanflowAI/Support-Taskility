/* eslint-env browser, node */
import Polyglot from 'node-polyglot'
import { getPhrases } from './phrases'
import { log, logEvents } from '../logs'

const getNavigatorLang = () =>
  typeof window !== 'undefined' && ((navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage)

const getCurrentLanguage = (userLang, requestedLanguage) => {
  const navigatorLang = getNavigatorLang()
  const defaultLang = 'es'
  return userLang || requestedLanguage || navigatorLang || defaultLang
}

const onMissingKey = (key, options, locale) => {
  log('warn', logEvents.missingI18nKey({ key, locale }))
  return ''
}

const polyglot = new Polyglot({ onMissingKey })

const isPolyglotReady = polyglotObj => polyglotObj && Object.keys(polyglotObj.phrases).length > 0

// TODO: USAR UN NAMESPACE PARA CARGAR POR CADA COMPONENTE PARA CARGAR SOLO EL DICCIONARIO DE TRADUCCIONES REQUERIDO
export const i18nInit = ({ user, requestedLanguage }) => {
  // TODO: Save last used language (localstorage) and prefer it over navigatorLang
  const userLang = user?.uiLanguage?.() // TODO: User accounts...
  const lang = getCurrentLanguage(userLang, requestedLanguage).slice(0, 2).toLowerCase()
  if (polyglot.locale() !== lang || !isPolyglotReady(polyglot)) {
    const { phrases, plurals } = getPhrases(lang)
    polyglot.replace(phrases)
    polyglot.locale(lang)
    polyglot.extend(plurals)
  }
}

export const i18n = (key, ...params) => {
  if (!isPolyglotReady(polyglot)) return 'not ready'
  return polyglot.t(key, ...params) || key
}
