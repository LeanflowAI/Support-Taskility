import { subDays } from 'date-fns'
import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { getExchangeRateFromApi } from 'services/exchange-rates'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'exchangeRates.errors.invalidUser' })

export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { dbService, query } = req
  const [fromCurrency, toCurrency] = query.params || ["",""]

  if (!fromCurrency || !toCurrency) {
    return next(new RequestError(400, 'exchangeRates.errors.invalidRequest'))
  }

  const yesterday = new Date(subDays(new Date(), 1).toDateString()) // toDateString() used to remove the hour informatioh from date
  const exchangeRate = await dbService.getExchangeRate(yesterday, fromCurrency, toCurrency)

  if (exchangeRate) {
    res.json({ ok: true, exchangeRate, date: yesterday })
    return next()
  }

  const dayRates = await getExchangeRateFromApi(yesterday, fromCurrency)
  if (dayRates !== null) {
    await dbService.saveExchangeRate(dayRates)
    res.json({ ok: true, exchangeRate: dayRates.rates[toCurrency] || 0, date: yesterday })
    return next()
  }

  res.json({ ok: false, exchangeRate: 0, date: yesterday })
  return next()
}

export default composeRoute([methodFilter(), checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)
