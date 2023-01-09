import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'newCfdi.errors.invalidUser' })

type RequestType = NextApiRequest & { dbService: DbService; loggedUser: User }

export const routeHandler = async (req: RequestType, res: NextApiResponse, next: Function) => {
  const { query, dbService } = req
  const [issuerId, receiverId] = query.params || ["",""]
  if (!issuerId) return next(new RequestError(400, 'newCfdi.errors.issuerIdRequired'))
  if (!receiverId) return next(new RequestError(400, 'newCfdi.errors.receiverIdRequired'))
  const relationshipFields = { creditDays: 1, cfdiUse: 1, paymentMethod: 1, paymentType: 1, bankAccountsList: 1 }
  const relationship = await dbService.getServiceRelationship(issuerId, receiverId, relationshipFields)
  const servicesFields = {
    referencia: 1,
    pendingAmount: 1,
    origin: 1,
    destination: 1,
    quotations: 1,
    orderClientReference: 1,
    observaciones: 1,
    submitted: 1,
  }
  const services = await dbService.getBillingPendingServices(issuerId, receiverId, servicesFields)
  res.json({ ok: true, relationship, services })
  return next()
}

export default composeRoute([methodFilter(), checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)
