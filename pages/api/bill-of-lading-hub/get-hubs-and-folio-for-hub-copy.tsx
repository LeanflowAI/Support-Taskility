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
  const { body, dbService, loggedUser, query }: { body: any; dbService: DbService; loggedUser: User; query: any } = req
  // const { id } = query
  const { hubsIds } = body
  console.log('hubsIds Backend', hubsIds)

  if (!hubsIds || hubsIds.length === 0) return next(new RequestError(400, 'saveNewPlace.errors.noData'))
  // console.log('BoLH in api:', BoLH, 'loggedUser in api', loggedUser)

  // get BoLHub from id
  const { originalHubs, hubCounter } = await dbService.getHubsForCopy(hubsIds)

  // console.log('BoLH _id in api:', _id)
  res.json({ originalHubs, hubCounter })
  return next()
}
export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: false }), routeHandler],
  errorHandler,
  dbConnectionClose
)
