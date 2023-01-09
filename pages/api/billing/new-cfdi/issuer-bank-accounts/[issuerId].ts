import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'newCfdi.errors.invalidUser' })

type Request = NextApiRequest & {
  dbService: DbService
  loggedUser: User
}

export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { dbService, loggedUser } = req
  const { issuerId } = req.query
  const { profile } = loggedUser
  if (!profile.companyId) return next(new RequestError(400, 'newCfdi.errors.userWithoutCompany'))
  const issuer = await dbService.getCompany({ companyId: issuerId as string, fields: { bankAccountsList: 1 } })
  if (!issuer) return next(new RequestError(400, 'newCfdi.errors.companyNotFound'))
  res.json({ ok: true, issuer })
  return next()
}

export default composeRoute(
  [methodFilter(), checkUserTokenMiddleware, dbConnection, loadUser(), routeHandler],
  errorHandler,
  dbConnectionClose
)
