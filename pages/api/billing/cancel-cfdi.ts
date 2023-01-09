import { NextApiRequest, NextApiResponse } from 'next'
import R from 'ramda'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { facturamaApi } from 'services/api/billing/facturamaApi'
import { DbService, User } from 'services/model'

type Request = NextApiRequest & { dbService: DbService; loggedUser: User }

export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, loggedUser, dbService }: { body: any; loggedUser: User; dbService: DbService } = req
  const { cfdiId }: { cfdiId: string } = body

  const cfdi = await dbService.getCfdi(cfdiId)
  if (!cfdi) return next(new RequestError(400, 'cancelCfdi.errors.cfdiNotFound'))

  // TODO: Validation to ensure the "loggedUser" (from req) have authorization to cancel the specified CFDI
  // TODO: Remake and improve authorizarion system
  // TODO: Ensure that the request comes from server if loggedUser is undefined
  // If the cancellation is requested by the server, the user is undefined
  if (loggedUser && !loggedUser.profile.canCancelInvoices) return next(new RequestError(400, 'cancelCfdi.errors.userCantCancelCfdis'))

  if (cfdi.status === 'canceled') return next(new RequestError(400, 'cancelCfdi.errors.alreadyCanceled'))

  const { cfdiType, relatedCfdis = [] } = cfdi
  const paymentProofs = relatedCfdis.filter(({ type }) => type === 'paymentProof')
  if (paymentProofs.length) {
    const paymentProofsUuids: string[] = paymentProofs.map(R.prop('uuid'))
    return next(new RequestError(400, 'cancelCfdi.errors.hasPaymentProof', { paymentProofsUuids }))
  }

  const { data: cancelResult, error } = await facturamaApi.cancelCfdi(cfdi.apiId)
  if (error) {
    const { cancelRequests } = cfdi
    // TODO: I18n -> i18n entries as functions instead of just strings
    const message = cancelRequests
      ? 'Ha ocurrido un error al consultar el estado del proceso de cancelación de la factura.'
      : `Ha ocurrido un error al anular la factura.
      ${error}

      El CFDI no se puede cancelar en el SAT por alguno de los siguientes supuestos:
      a) Esta factura tiene menos de 48 horas de creada,
      b) Es una factura con método de pago a parcialidades o diferido
      c) Es un CFDI complemento de pago.
      Por lo tanto esta factura se debe cancelar en el SAT y subir el comprobante correspondiente.`
    return next(new RequestError(400, 'cancelCfdi.errors.apiError', { message }))
  }

  // Posible status values (cancelResult.Status) https://www.api.facturama.com.mx/guias/api-multi/cfdi/cancelacion
  const { Status: status, Message: cancelResultMessage, RequestDate: requestDate } = cancelResult
  // cancelDate and acuseXmlBase64 are defined only on successful cancel
  const { CancelationDate: cancelDate, AcuseXmlBase64: acuseXmlBase64 } = cancelResult
  // TODO: Set a minimum required time between cancel requests.
  await dbService.addCfdiCancelRequest({ cfdiId, user: loggedUser, requestDate, cancelResultMessage, cancelDate })
  if (status === 'active') {
    // active = Invoice can't be cancelled. Notify the reason given by the API response (message).
    return next(new RequestError(400, 'cancelCfdi.errors.apiError', { status, message: cancelResult.Message }))
  }

  // TODO: HANDLE 'rejected' API STATUS
  const cfdiIsCancelledOnApi = ['pending', 'canceled', 'acepted', 'expired'].includes(status)
  if (cfdiIsCancelledOnApi) {
    await dbService.setCfdiAsCanceled(cfdiId, cancelDate, status === 'pending')
    const eventDetails = { id: cfdiId, type: cfdiType, number: cfdi.folio || null }
    await dbService.addEventLog(dbService.eventLogTypes.cancelCfdi, eventDetails, loggedUser)
  }

  if (acuseXmlBase64) await dbService.attachCfdiBase64CancelXml({ cfdiId, xmlDocument: acuseXmlBase64 })

  res.json({ ok: true, status, message: cancelResultMessage })
  return next()
}

export default composeRoute(
  [
    methodFilter('post'),
    checkUserToken({ errorMessage: 'cancelCfdi.errors.invalidUser' }),
    dbConnection,
    loadUser({ isRequired: false }),
    routeHandler,
  ],
  errorHandler,
  dbConnectionClose
)
