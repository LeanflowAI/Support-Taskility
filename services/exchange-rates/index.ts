import { format } from 'date-fns'
import { get } from '../fetch'

export const getExchangeRateFromApi = async (date: Date, fromCurrency: string) => {
  const dateToQuery = format(date, 'yyyy-MM-dd')
  const fixerApiKey = process.env.FIXER_API_KEY
  const url = `https://data.fixer.io/api/${dateToQuery}?access_key=${fixerApiKey}&base=${fromCurrency}`
  try {
    const { success, base, rates } = await get(url)
    if (success) return { base, date, rates: rates }
  } catch (error) {
    return null
  }
  return null
}
