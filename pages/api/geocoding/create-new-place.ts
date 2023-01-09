import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'saveCfdiDraft.errors.invalidUser' })

export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { body: place, dbService, loggedUser }: { body: any; dbService: DbService; loggedUser: User } = req
  const newPlace = { ...place, createdAt: new Date(), createdBy: loggedUser._id }
  if (!place) return next(new RequestError(400, 'saveNewPlace.errors.noData'))
  const { _id } = await dbService.saveNewPlace(newPlace)
  res.json({ ok: true, _id: _id })
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: false }), routeHandler],
  errorHandler,
  dbConnectionClose
)
