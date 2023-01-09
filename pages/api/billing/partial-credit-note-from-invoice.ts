import { NextApiRequest, NextApiResponse } from 'next'
import { DbService, User } from 'services/model'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { createInvoiceOrCreditNote } from './create-cfdi'

type Request = NextApiRequest & { dbService: DbService; loggedUser: User }

export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService }: { body: any; loggedUser: User; dbService: DbService } = req
  const {
    cfdiId,
    tax,
    ivaRet,
    total,
    amount,
    currency,
    haveTax,
    haveIvaRet,
  }: {
    cfdiId: string
    tax: number
    ivaRet: number
    total: number
    amount: number
    currency: string
    haveTax: boolean
    haveIvaRet: boolean
  } = body

  const cfdi = await dbService.getCfdi(cfdiId)
  if (!cfdi) return next(new RequestError(400, 'creditNoteFromInvoice.errors.cfdiNotFound'))

  if (cfdi.cfdiType !== 'invoice') return next(new RequestError(400, 'creditNoteFromInvoice.errors.cfdiIsNotAnInvoice'))

  // TODO: Validation to ensure the "loggedUser" (from req) have authorization to cancel the specified CFDI
  // TODO: Remake and improve authorizarion system
  if (cfdi.status === 'canceled') return next(new RequestError(400, 'creditNoteFromInvoice.errors.alreadyCanceled'))

  const generateTaxes = (hasTax: boolean, hasIvaRet: boolean) => {
    if (!hasTax && !hasIvaRet) return []
    if (hasTax && !hasIvaRet) return [{ name: 'iva', rate: 0.16, isRetention: false, value: tax }]
    if (!hasTax && hasIvaRet) return [{ name: 'iva', rate: 0.04, isRetention: true, value: ivaRet }]
    if (hasTax && hasIvaRet)
      return [
        { name: 'iva', rate: 0.16, isRetention: false, value: tax },
        { name: 'iva', rate: 0.04, isRetention: true, value: ivaRet },
      ]
    return null
  }

  const newCreditNote = {
    cfdiType: 'creditNote',
    issuerId: cfdi.issuer.id,
    receiverId: cfdi.receiver.id,
    currency: currency,
    exchangeRate: cfdi.exchangeRate,
    paymentMethod: 'PUE',
    paymentType: cfdi.pendingAmount === 0 ? cfdi.paymentTerms?.slice(0, 2) : '15',
    creditDays: cfdi.paymentConditions === 'Contado' ? 0 : Number(cfdi.paymentConditions?.split(' días')[0]),
    cfdiUse: 'G02',
    notes: `Nota de crédito Parcial aplicada a la factura con folio:  ${cfdi.folio} y UUID: ${cfdi.uuid}.`,
    items: [
      {
        productCode: '84111506',
        unit: 'ACT',
        quantity: 1,
        unitValue: amount,
        subtotal: amount,
        total: total,
        taxes: generateTaxes(haveTax, haveIvaRet),
        // The credit note don't require the service.quotationId field. Remove it
        // service: service ? { id: service.id } : undefined,
        invoiceId: cfdi._id,
      },
    ],
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
