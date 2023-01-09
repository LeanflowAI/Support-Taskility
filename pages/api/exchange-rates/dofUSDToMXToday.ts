import { ConsoleSqlOutlined } from '@ant-design/icons'
import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import {
  methodFilter,
  checkUserToken,
  dbConnection,
  dbConnectionClose,
  errorHandler,
  loadUser,
} from 'services/api/helpers/middlewares'
import { DbService, SatAddress, User } from 'services/model'
import { getExchangeRateFromDofMx } from '../../../services/sat/getExchangeRateFromDOFMx'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; userId: string; loggedUser: User }

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, loggedUser, query } = req
  // const { filters, searchText, skip } = body
  // const { shipmentId } = query
  // console.log(`shipmentId to search: ${shipmentId}`)

  // Get the Sat Codification from Database
  // const shipmentPosition = await dbService.getShipmentLastPosition(shipmentId as string)

  const currentDate = new Date()
  const currentDay = currentDate.getDate().toString().padStart(2,"0")
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2,"0")
  const currentYear = currentDate.getFullYear().toString()

  // console.log('currentDate', currentDate)
  // console.log('currentDay', currentDay)
  // console.log('currentMonth', currentMonth)
  // console.log('currentYear', currentYear)

  const exchangeRate = await getExchangeRateFromDofMx(currentDay,currentMonth,currentYear)
  // console.log('exchangeRate in api', exchangeRate)
  await dbService.saveExchangeRateDoF(currentDate, exchangeRate!)
  
  // console.log('shipmentPosition Found: ', shipmentPosition)
  res.json({currentDate, exchangeRate})
  // res.json({ postalCode, countryCodeO, stateCode, municipalityCode, localityCode, countryCode })
  return next()
}

export default composeRoute([methodFilter('get'), dbConnection, routeHandler], errorHandler, dbConnectionClose)
