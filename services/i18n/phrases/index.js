// TODO: Structure as a server method to retrieve only the requiered language phrases.

import { es, esPlurals } from './es'
import { en, enPlurals } from './en'

const phrases = { es, en }
const plurals = { es: esPlurals, en: enPlurals }

export const getPhrases = lang => {
  return {
    phrases: phrases[lang],
    plurals: plurals[lang],
  }
}
