import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { facturamaApi } from 'services/api/billing/facturamaApi'

// TODO: Testing
export const routeHandler = async (req, res, next) => {
  const { body, dbService } = req
  const { cfdiId } = body

  // TODO: Validation to ensure the "loggedUser" (from req) have authorization to retrieve the requested XML document
  if (!cfdiId) return next(new RequestError(400, 'getCfdiXml.errors.invalidUser'))

  const cfdi = await dbService.getCfdi(cfdiId)
  if (!cfdi) return next(new RequestError(400, 'getCfdiXml.errors.invalidCfdi'))

  const { xmlDocumentId } = cfdi
  if (xmlDocumentId) {
    const { base64Data } = await dbService.getAttachedFileById(xmlDocumentId)
    res.json({ ok: true, xmlDocument: base64Data })
    return next()
  }

  const { data, error } = await facturamaApi.getCfdiXml(cfdi.apiId)
  if (error) return next(new RequestError(400, 'getCfdiXml.errors.failToRetrieveFromApi'))

  let { Content: xmlDocument } = data
  xmlDocument = `data:application/xml;base64,${xmlDocument}`

  // YO SOY ABUNDANCIA
  await dbService.attachCfdiBase64Xml({ cfdiId: cfdi._id, xmlDocument })
  res.json({ ok: true, xmlDocument })
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserToken({ errorMessage: 'getCfdiXml.errors.invalidUser' }), dbConnection, loadUser(), routeHandler],
  errorHandler,
  dbConnectionClose
)
