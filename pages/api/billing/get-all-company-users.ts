import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'newCfdi.errors.invalidUser' })

export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { dbService, loggedUser } = req
  const { profile } = loggedUser
  if (!profile.companyId) return next(new RequestError(400, 'newCfdi.errors.userWithoutCompany'))
  const users = await dbService.getUsersList(loggedUser)
  console.log('users', users)
  res.json({ ok: true, users })
  return next()
}

export default composeRoute(
  [methodFilter(), checkUserTokenMiddleware, dbConnection, loadUser(), routeHandler],
  errorHandler,
  dbConnectionClose
)