import { NextApiRequest, NextApiResponse } from 'next'
import { DbService, User } from 'services/model'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { createInvoiceOrCreditNote } from './create-cfdi'

type Request = NextApiRequest & { dbService: DbService; loggedUser: User }

export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService }: { body: any; loggedUser: User; dbService: DbService } = req
  const { cfdiId }: { cfdiId: string } = body

  const cfdi = await dbService.getCfdi(cfdiId)
  if (!cfdi) return next(new RequestError(400, 'creditNoteFromInvoice.errors.cfdiNotFound'))

  if (cfdi.cfdiType !== 'invoice') return next(new RequestError(400, 'creditNoteFromInvoice.errors.cfdiIsNotAnInvoice'))

  // TODO: Validation to ensure the "loggedUser" (from req) have authorization to cancel the specified CFDI
  // TODO: Remake and improve authorizarion system
  if (cfdi.status === 'canceled') return next(new RequestError(400, 'creditNoteFromInvoice.errors.alreadyCanceled'))

  const newCreditNote = {
    cfdiType: 'creditNote',
    issuerId: cfdi.issuer.id,
    receiverId: cfdi.receiver.id,
    currency: cfdi.shortCurrency,
    exchangeRate: cfdi.exchangeRate,
    paymentMethod: 'PUE',
    paymentType: cfdi.paymentTerms?.slice(0, 2),
    creditDays: cfdi.paymentConditions === 'Contado' ? 0 : Number(cfdi.paymentConditions?.split(' días')[0]),
    cfdiUse: cfdi.receiver.cfdiUse || 'P01',
    notes: `Cancelación de factura ${cfdi.folio}`,
    items: cfdi.items?.map(({ id, service, ...item }) => ({
      ...item,
      // The credit note don't require the service.quotationId field. Remove it
      service: service ? { id: service.id } : undefined,
      invoiceId: cfdi._id,
    })),
  }

  req.body = newCreditNote
  return next()
}

export default composeRoute(
  [
    methodFilter('post'),
    checkUserToken({ errorMessage: 'creditNoteFromInvoice.errors.invalidUser' }),
    dbConnection,
    loadUser({ isRequired: false }),
    routeHandler,
    createInvoiceOrCreditNote,
  ],
  errorHandler,
  dbConnectionClose
)
