import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'saveCfdiDraft.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; loggedUser: User }

export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { body: BoLH, dbService, loggedUser }: { body: any; dbService: DbService; loggedUser: User } = req
  if (!BoLH) return next(new RequestError(400, 'saveNewPlace.errors.noData'))
  // console.log('BoLH in api:', BoLH, 'loggedUser in api', loggedUser)

  const { _id } = await dbService.saveNewBoLH(BoLH, loggedUser._id, loggedUser.profile?.companyId, loggedUser, BoLH.createShipmentWithHub)
  // console.log('BoLH _id in api:', _id)
  res.json({ ok: true, _id: _id })
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: false }), routeHandler],
  errorHandler,
  dbConnectionClose
)
