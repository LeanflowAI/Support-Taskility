import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'


export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { body, dbService, loggedUser } = req
  if (!body) return next(new RequestError(400, 'saveNewPlace.errors.noData'))
  const { shipmentId, coords, timestamp } = body
  const companyId = 'bugL7uZvYvcodAENJ' // TODO: Make sure to get from shipmentId the correct company to associate position of the shipment
  // console.log('product in api:', product, 'loggedUser in api', loggedUser)
  await dbService.saveNewTrackingPosition(shipmentId, coords, timestamp, companyId)
  res.json({ ok: true })
  return next()
}

export default composeRoute(
  [methodFilter('post'), dbConnection, loadUser({ isRequired: false }), routeHandler],
  errorHandler,
  dbConnectionClose
)