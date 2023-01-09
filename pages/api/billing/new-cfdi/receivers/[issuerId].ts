import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'newCfdi.errors.invalidUser' })

export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { query, dbService } = req
  const { issuerId } = query
  if (!issuerId) return next(new RequestError(400, 'newCfdi.errors.issuerIdRequired'))
  const fields = { rfc: 1, name: 1, fiscalRegime: 1, address: 1 }
  const clients = await dbService.getCompanyClients({ providerCompanyId: issuerId as string, fields })
  res.json({ ok: true, receivers: clients })
  return next()
}

export default composeRoute([methodFilter(), checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)
