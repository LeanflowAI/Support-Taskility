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

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; userId: string; loggedUser: User }

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, loggedUser, query } = req
  // const { filters, searchText, skip } = body
  const { shipmentId } = query
  // console.log(`shipmentId to search: ${shipmentId}`)

  // Get the Sat Codification from Database
  const shipmentPosition = await dbService.getShipmentLastPosition(shipmentId as string)

  // console.log('shipmentPosition Found: ', shipmentPosition)
  res.json(shipmentPosition)
  // res.json({ postalCode, countryCodeO, stateCode, municipalityCode, localityCode, countryCode })
  return next()
}

export default composeRoute(
  [methodFilter('get'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: true }), routeHandler],
  errorHandler,
  dbConnectionClose
)