import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'newCfdi.errors.invalidUser' })

type RequestType = NextApiRequest & { dbService: DbService; loggedUser: User }

export const routeHandler = async (req: RequestType, res: NextApiResponse, next: Function) => {
  const { query, dbService } = req
  // const issuerId : string = query.params[0] === undefined ? "" : query.params[0] || ""
  // const receiverId = query.params[1] || ""
  const [issuerId, receiverId] = query.params || ["",""]
  if (!issuerId) return next(new RequestError(400, 'newCfdi.errors.issuerIdRequired'))
  if (!receiverId) return next(new RequestError(400, 'newCfdi.errors.receiverIdRequired'))
  const invoiceFields = {
    folio: 1,
    total: 1,
    shortCurrency: 1,
    payedAmount: 1,
    pendingAmount: 1,
    uuid: 1,
    paymentMethod: 1,
    relatedCfdis: 1,
  }
  const invoices = await dbService.getPaymentProofPendingInvoices(issuerId, receiverId, invoiceFields)
  res.json({ ok: true, invoices })
  return next()
}

export default composeRoute([methodFilter(), checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)
